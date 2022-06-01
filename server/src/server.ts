import { cloneKeys } from "./lib/clone"
import { DataBase, DataBaseSubscription } from "josm"
import setup from "./setup"
import sizeOfObject from "object-sizeof"
import mongoApi from "./mongoApi"
// recursive needed?
import projectObject from "project-obj"
// recurisive needed?
import merge from "deepmerge"
import { stringify, parse } from "./../../app/lib/serialize"
import crypto from "crypto"
import argon2 from "argon2"
import { mergeOldRecursionToDB, resolveOldRecursion } from "../../app/lib/networkDataBase"
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';






type Await<T> = T extends Promise<infer U> ? U : T











function justifyNesting(obj: any) {
  let just = false;
  const deeper = [];
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "object") deeper.push({ key, val });
    else just = true;
  }

  for (const { key, val } of deeper) {
    if (justifyNesting(val)) just = true;
    else delete obj[key];
  }
  return just;
}


// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
// const p = argon2.hash("password", {
//   type: argon2.argon2id,
//   memoryCost: 37888, // 37 MiB
//   timeCost: 2,
//   parallelism: 1
// })

// p.then((s) => {
//   const ss = "$argon2id$v=19$m=37888,t=2,p=1$LokGkIzdPuP1FiF7HAyLiw$IHCQ/631fYFfF+ARfja4lHId56w3k5P1N21TakX6AK4"
//   console.log(s === ss)
//   console.log(s)
//   argon2.verify(ss, "password").then(console.log)

// })

// const sessionKey = crypto.randomBytes(32).toString("hex")

// console.log("sessionKey", sessionKey)

const session = {} as any


setup("xcenic", async (app, db) => {

  type UserModel = {
    id: string;
    username: string;
    currentChallenge?: string;
  };
  

/**
 * It is strongly advised that authenticators get their own DB
 * table, ideally with a foreign key to a specific UserModel.
 *
 * "SQL" tags below are suggestions for column data types and
 * how best to store data received during registration for use
 * in subsequent authentications.
 */
 type Authenticator = {
  // SQL: Encode to base64url then store as `TEXT`. Index this column
  credentialID: Buffer;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  credentialPublicKey: Buffer;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransport[];
};


  // Human-readable title for your website
  const rpName = 'Xcenic Example';
  // A unique identifier for your website
  const rpID = 'localhost';
  // The URL at which registrations and authentications should occur
  const origin = `https://${rpID}`;



  function getUserFromDB(id: any) {
    const user = {
      id: "mmairinger",
      username: "max",
      credentials: {} as {[credIdAsString in string]: Authenticator}
    }
    return user
  }
  

  const tempStoreChellange = {} as {[username in string]: string}


  app.post("/api/webauthn/register", async (req, res) => {
    const user = getUserFromDB(req.body.username)
    const userAuthenticators: Authenticator[] = Object.keys(user.credentials).map((key) => user.credentials[key])
  
    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.username,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: 'indirect',
      // Prevent users from re-registering existing authenticators
      excludeCredentials: userAuthenticators.map(authenticator => ({
        id: authenticator.credentialID,
        type: 'public-key',
        // Optional
        transports: authenticator.transports,
      })),
    });

    tempStoreChellange[user.username] = options.challenge

    res.send(options)
  })

  app.post("/api/webauthn/register/verify", async (req, res) => {
    const { body } = req;

    // (Pseudocode) Retrieve the logged-in user
    const user = getUserFromDB("loggedInUserId");
    // (Pseudocode) Get `options.challenge` that was saved above
    const expectedChallenge: string = tempStoreChellange[user.username]

    let verification: Await<ReturnType<typeof verifyRegistrationResponse>>;
    try {
      verification = await verifyRegistrationResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID, counter,  } = registrationInfo

      const authenticator: Authenticator = {
        credentialPublicKey,
        credentialID,
        counter,
      };

      user.credentials[(credentialID as Buffer).toString("utf-8")] = authenticator
    }

    res.send({ verified })
  })


  app.post("/api/webauthn/auth", async (req, res) => {
    // (Pseudocode) Retrieve the logged-in user
    const user = getUserFromDB("loggedInUserId");
    // (Pseudocode) Retrieve any of the user's previously-
    // registered authenticators
    const userAuthenticators: Authenticator[] = Object.keys(user.credentials).map((key) => user.credentials[key])

    const options = generateAuthenticationOptions({
      // Require users to use a previously-registered authenticator
      allowCredentials: userAuthenticators.map(authenticator => ({
        id: authenticator.credentialID,
        type: 'public-key',
        // Optional
        transports: authenticator.transports,
      })),
      userVerification: 'preferred',
    });

    // (Pseudocode) Remember this challenge for this user
    tempStoreChellange[user.username] = options.challenge

    res.send(options)
  })

  app.post("/api/webauthn/auth/verify", async (req, res) => {
    const { body } = req;

    // (Pseudocode) Retrieve the logged-in user
    const user = getUserFromDB("loggedInUserId");
    // (Pseudocode) Get `options.challenge` that was saved above
    const expectedChallenge: string = tempStoreChellange[user.username]
    // (Pseudocode} Retrieve an authenticator from the DB that
    // should match the `id` in the returned credential
    const authenticator: Authenticator = user.credentials[(body.id as Buffer).toString("utf-8")]

    if (!authenticator) {
      throw new Error(`Could not find authenticator ${body.id} for user ${user.id}`);
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        credential: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;
    if (verified && authenticationInfo) {
      const { newCounter } = authenticationInfo;
      authenticator.counter = newCounter;
    }


    res.send(verified)
  })







  
  // const max = {
  //   myName: "Max",
  //   age: 27
  
  // }
  
  // const ting = {
  //   myName: "Ting",
  //   age: 23
  // }

  // // @ts-ignore
  // max.loves = ting
  // // @ts-ignore
  // ting.loves = max

  
  // let ob = {
  //   ppl: max
  // }

  // const mongTest = await mongoApi(db.collection("test123"))
  // const josmTest = new DataBase(await mongTest.get())


  // josmTest(function sub(full, diff) {
  //   // console.log(diff)
  //   console.log("dev")
  //   console.log(resolveOldRecursion(diff, sub))

  //   // mongTest.set(resolveOldRecursion(diff, sub))
  // }, true, false)
  
  // console.log("dd")
  // josmTest(ob)
  // ob = josmTest() as any
  
  // josmTest({nono: (ob as any).leeeel})

  // console.log(cloneKeys(josmTest()))


  // josmTest({newPPl: {ppl2: josmTest().ppl.loves}})

  // console.log(josmTest())






  // const mongo = await mongoApi(db.collection("lang"))
  // const josm = new DataBase(await mongo.get())
  // josm((full, diff) => {
  //   mongo.set(diff)
  // }, true, false)



  // app.ws("/lang", (ws, req) => {
  //   let projection = {}
  //   console.log("new ws")


  //   const dataBaseSubscription = josm((full, diff) => {
  //     ws.send(stringify(projectObject(diff as any, projection)))
  //   }, false) as DataBaseSubscription<[any]>

  //   ws.on("message", (rawMsg) => {
  //     console.log("rawMsg", rawMsg)
  //     if (sizeOfObject(rawMsg) > 100000) return
  //     console.log("thisfar")

  //     const msg = parse(rawMsg as any as string)
  //     console.log("thisfar2")
  //     if (msg.get !== undefined) {
  //       dataBaseSubscription.activate(false)
  //       projection = merge(projection, msg.get, {})
  //       ws.send(stringify(projectObject(josm() as any, msg.get)))
  //     }
  //     if (msg.set) {
  //       dataBaseSubscription.setToDataBase(msg.set)
  //     }
      
  //   })

  //   ws.on("close", () => {
  //     dataBaseSubscription.deactivate()
  //     console.log("close")
  //   })
  // })

  
  app.post("/addEntry", (req, res) => {
    const entry = req.body
    if (sizeOfObject(entry) > 100000) {
      res.send({
        msg: "Entry is too big",
        success: false
      })
      return
    }
    entry.time = Date.now()

    console.log("getting entry", entry)

    db.collection("contactData").insertOne(entry, (err, result) => {
      if (err) {
        res.send({
          msg: "DB error",
          success: false
        })
      } else {
        res.send({
          success: true
        })
      }
    })
  })
})


