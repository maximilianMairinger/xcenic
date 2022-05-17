import { Collection, ObjectID } from "mongodb"
import { resolvePointer } from "../../app/lib/networkDataBase"



export default async function mongoApi(db: Collection<any>) {
  // const client = await MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true })
  // const superDB = client.db(dbName)
  // const db = superDB.collection(collectionName)


  let _rootId = await db.findOne({})
  if (!_rootId) {
    const ret = await db.insertOne({})
    _rootId = ret.insertedId
  }
  else {
    _rootId = _rootId._id
  }
  const rootId = _rootId





  async function set(object: object = {}) {
    await recMergeObjectToMongoObject(object, rootId, new Map())
  }

  async function lookupIdAtPath(paths: string[]) {
    let _id = rootId
    if (paths.length === 0 || (paths.length === 1 && paths[0] === "")) return _id
    for (const path of paths) {
      _id = (await db.findOne({ _id }, { projection: { _id: false, [path]: true } }))[path]
      if (!_id) return null
    }
    return _id
  }


  async function recMergeObjectToMongoObject(object: object, _id: any, memoJsToMongo: Map<object, ObjectID | Promise<ObjectID>>) {
    const haveId = _id !== undefined
    let resMemo: (id: ObjectID) => void
    if (haveId) memoJsToMongo.set(object, _id)
    else memoJsToMongo.set(object, new Promise<ObjectID>((res) => {resMemo = res}))
    const localAddOb = {}
    const localRmOb = {}
    const nestedOb = {}
    const linkOb = {}
    for (const key in object) {
      const val = object[key]
      if (val instanceof Object) {
        const kk = Object.keys(val)[0]
        if (kk === "$ref" && typeof val[kk] === "string") {
          if (val[kk].startsWith("##")) {
            val[kk] = val[kk].slice(1)
            nestedOb[key] = true
          }
          else linkOb[key] = resolvePointer(val[kk])
        }
        else nestedOb[key] = true
      }
      else {
        if (val === undefined) localRmOb[key] = false
        else localAddOb[key] = val
          
          
        
      }
    }


    let surely_id: Promise<ObjectID>

    const linkRes = (async () => {
      const prom = []
      for (const key in linkOb) {
        prom.push(lookupIdAtPath(linkOb[key]).then((id) => {
          if (id !== null) localAddOb[key] = id
        }))
      }
      await Promise.all(prom)
    })()


    const proms = []
    if (haveId) {
      surely_id = Promise.resolve(_id)
      
      // transaction??? 
      await db.findOne({ _id }, { projection: { ...nestedOb, _id: false } }).then(insertIdsRecursively).then(async (updateOb) => {
        await linkRes
        // unhandled: if replacing a reference to another document, delete it if no no other references are present
        await db.updateOne({ _id }, { $set: { ...localAddOb, ...updateOb }, $unset: localRmOb })
      })
      
      
    }
    else {
      let resId: Function
      surely_id = new Promise((res) => {resId = res})
      return await insertIdsRecursively({}).then(async (updateOb) => {
        await linkRes
        const { insertedId } = (await db.insertOne({ ...localAddOb, ...updateOb }))
        resMemo(insertedId)
        resId(insertedId)
        return insertedId
      })
    }

    






    async function insertIdsRecursively(ids: any) {
      const newProms = []
      for (const key in nestedOb) {
        const memo = memoJsToMongo.get(object[key])
        if (memo !== undefined) {
          proms.push((async () => {
            const wemo = await memo
            if (!wemo.equals(ids[key])) await db.updateOne({ _id: await surely_id }, { $set: { [key]: wemo } })
          })())

          continue
        }
        console.log("rec", key)
        const res = recMergeObjectToMongoObject(object[key], ids[key], memoJsToMongo)
        console.log("donerec")
        
        if (!(ids[key] instanceof ObjectID)) newProms.push(res.then((insertedId) => {return {key, insertedId}}))
        else proms.push(res)
      }
      const insertedList = await Promise.all(newProms)
      console.log("donerec2")
      const updateOb = {}
      for (const inserted of insertedList) {
        if (inserted !== undefined) updateOb[inserted.key] = inserted.insertedId
      }
      return updateOb
    }


    await Promise.all(proms)
    
  }

  






  async function get(projection?: object) {
    const ret = await recRestrictedMongoObjectToJsObject(rootId, projection, new Map())
    return ret
  }


  // converts the mongodb relations via ObjectID to js relations
  async function recRestrictedMongoObjectToJsObject(_id: ObjectID, projection: object = {}, memoMonToJs: Map<string, object>) {
    const memoFinding = memoMonToJs.get(_id.toString())
    if (memoFinding !== undefined) return memoFinding
    const endOb = {}
    memoMonToJs.set(_id.toString(), endOb)

    const localProjection = {} as object
    for (const key in projection) {
      localProjection[key] = true
    }
    (localProjection as any)._id = false

    const mongoOb = await db.findOne({ _id }, { projection: localProjection })

    let proms = []
    for (const key in mongoOb) {
      if (mongoOb[key] instanceof ObjectID) {
        console.log("rec", key)
        proms.push(recRestrictedMongoObjectToJsObject(mongoOb[key], projection[key], memoMonToJs).then((r) => {
          endOb[key] = r
        }))
      }
      else {
        endOb[key] = mongoOb[key]
      }
    }
    await Promise.all(proms)


    return endOb
  }


  return {
    get,
    set
  }

}

