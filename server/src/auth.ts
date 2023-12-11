import argon2 from "argon2"
import crypto from "crypto"
import delay, { decomposedAbsoluteToDeltaTime } from "tiny-delay"
import milliseconds from "milliseconds"


import { Data as DATA, DataSubscription, DataBaseSubscription, DataCollection } from "josm"
import { DataBase as DATABASE } from "josm"
import { setDataDerivativeIndex } from "josm"
import { OptionallyExtendedData, OptionallyExtendedDataBase } from "josm"

function now() {
  return Date.now()
}

// webauthn:
// https://github.com/fido-alliance/webauthn-demo/blob/c9b088bd0a2107562092ab72943818f35b65c2f6/routes/webauthn.js
// https://webauthn.guide

// const sessionKey = crypto.randomBytes(32).toString("hex")

// console.log("sessionKey", sessionKey)


type PasswordType = "__PASSWORD_TYPE"

class Password extends DATA<PasswordType> {
  static type: PasswordType;
  async encryptAndSet(password: string) {
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    const s = await argon2.hash(password as string, {
      type: argon2.argon2id,
      memoryCost: 37888, // 37 MiB
      timeCost: 2,
      parallelism: 1
    })

    this.set(s as any)
  }
  verifyPassword(password: string) {
    return argon2.verify(this.get(), password)
  }
}


const { Data: _Data, types: _DataTypes, setDataBaseDerivativeIndex, parseDataBase } = setDataDerivativeIndex(
  Password
)

// import { authenticator } from "otplib"



// const secret = authenticator.generateSecret()
// console.log("secret", secret)
// const token = authenticator.generate(secret)
// console.log(authenticator.keyuri("max", "xcenic", secret))

const ExDataBase = parseDataBase(DATABASE)



type Date = number
type DayTime = number
type TimedDate = number
type AccessRight = object
type OtpSecret = string
type Authenticators = ['usb', 'ble', 'nfc', "internal"][number]
type WebAuthn = {
  publicKey: string
  id: string,
  authenticators: Authenticators[],
  
}



type UserType = {
  readonly username: string,
  password: PasswordType,
  created: TimedDate,
  accessRights: {
    read: AccessRight,
    write: AccessRight
  },
  // twoFactors: {
  //   device?: {
  //     [deviceKey in string]: {
  //       deviceName: string,
  //       lastUsed: TimedDate
  //     }
  //   },
  //   otp?: OtpSecret,
  //   email?: string,
  //   phone?: string,
  //   webauthn?: WebAuthn
  // },
  sessions: {
    [sessionKey in string]: SessionType
  },
  sessionHistory: {
    [sessionKey in string]: SessionType
  },
  stats?: {
    email?: string,
    phone?: string,
    firstName?: string,
    lastName?: string,
    birthDate?: Date,
  }
}


type SessionType = {
  created: TimedDate,
  lastActive: TimedDate,
  longSession: boolean,
  readonly sessionKey: string
}




const sessionTimes = {
  long: {
    created: milliseconds.months(9),
    lastActive: milliseconds.weeks(3)
  },
  short: {
    created: milliseconds.hours(12),
    lastActive: milliseconds.hours(1)
  }
}

function genSessionKey() {
  return crypto.randomBytes(64).toString("utf-8")
}


const { DataBase: _DataBase, types: DataBaseTypes } = setDataBaseDerivativeIndex(
  class User extends ExDataBase<UserType> {
    static type: UserType;
    isSessionActive(sessKey: string) {
      return (Object as any).hasOwn(this.sessions, sessKey)
    }
    findActiveSession(sessKey: string) {
      if (this.isSessionActive(sessKey))
        return this.sessions[sessKey]
      else return null
    }
    
    isSessionExpired(sessKey: string) {
      return (Object as any).hasOwn(this.sessionHistory, sessKey)
    }
    findExpiredSession(sessKey: string) {
      if (this.isSessionExpired(sessKey))
        return this.sessionHistory[sessKey]
      else return null
    }
    createSession(longSession: boolean = false) {
      const sessionKey = genSessionKey()      
      const nowTime = now()

      this.sessions({[sessionKey]: {
        created: nowTime,
        lastActive: nowTime,
        longSession,
        sessionKey
      }})

      const session = this.sessions[sessionKey]
      this.attachSessionInvalidationListener(session)
      return session
    }
    attachSessionInvalidationListener(session_key: DATABASE<SessionType> | string) {
      const session = typeof session_key === "string" ? this.findActiveSession(session_key) : session_key
      if (session !== null) {
        const unsubLs = [] as (() => void)[]
        for (const _from of ["created", "lastActive"]) {
          const from = _from as ["created", "lastActive"][number]
          
          const duration = session.longSession.tunnel((longSession: boolean) => {
            const durVerb = longSession ? "long" : "short"
            return sessionTimes[durVerb][from]
          }) as DATA<number>

          const time = decomposedAbsoluteToDeltaTime(duration, session[from])
          const delayInstance = delay(time)
          delayInstance.then(() => {
            this.logout(session)
          })
          unsubLs.push(() => {
            delayInstance.cancel()
          })
        }
        return true
      }
      else return false
    }

    denoteThatSessionHasBeenAccessed(session_key: string | DATABASE<SessionType>) {
      const session = typeof session_key === "string" ? this.findActiveSession(session_key) : session_key
      if (session !== null) {
        session.lastActive.set(now())
        return true
      }
      else return false
    }

    logout(session_key: DATABASE<SessionType> | string) {
      const session = typeof session_key === "string" ? this.findActiveSession(session_key) : session_key

      if (session === null) return false
      else {
        this.sessionHistory({[session.sessionKey.get()]: session()})
        this.sessions({[session.sessionKey.get()]: undefined})
        return true
      }
    }
  }
)





// types



// type DataTypes = {
//   [key in keyof typeof _DataTypes]: typeof _DataTypes[key]
// }

// resolves to...

// export type DataTypes = {
//   tt: [typeof Password];
//   ww: [PasswordType];
// }

// export type DataBaseTypes = {
//   [key in keyof typeof DataBaseTypes]: typeof DataBaseTypes[key]
// }

// resolves to...

// export type DataBaseTypes = {
//   w: [object[], symbol[], boolean[], string[], number[], (string | number | boolean | symbol | object)[]];
//   t: [ArrayListClass<object>, ArrayListClass<symbol>, ArrayListClass<boolean>, ArrayListClass<string>, ArrayListClass<number>, ArrayListClass<number | object | symbol | boolean | string>];
// }



// export type Data<Value, _Default extends Value = Value> = OptionallyExtendedData<DataTypes["tt"], DataTypes["ww"], Value, _Default>
// export type DataBase<Store extends object> = OptionallyExtendedDataBase<Store, DataBaseTypes["t"], DataBaseTypes["w"], DataTypes["tt"], DataTypes["ww"]>



// export const Data = _Data
// export const DataBase = _DataBase





























// type Date = number
// type DayTime = number
// type TimedDate = number

// type SessionType = {
//   created: TimedDate,
//   lastActive: TimedDate,
//   longSession: boolean,
//   sessionKey: string
// }

// type User = {
//   username: string,
//   passwordHash: string,
//   created: TimedDate,
//   sessions: {
//     [sessionKey in string]: SessionType
//   },
//   sessionHistory: {
//     [sessionKey in string]: SessionType
//   },
//   stats?: {
//     email?: string,
//     phone?: string,
//     firstName?: string,
//     lastName?: string,
//     birthDate?: Date,
//   }
// }

// type AuthDB = DataBase<{
//   user: {
//     [username in string]: User
//   }
// }>

// export default async function auth(db: AuthDB) {
//   db({
//     user: {},
//     session: {}
//   })

//   const initState = db()



//   function createSession(username: string, wantsLongSession: boolean) {
//     const sessionKey = crypto.randomBytes(32).toString("utf-8")
//     const user = db.user[username]
//     user.sessions({[sessionKey]: {
//       created: Date.now(),
//       lastActive: Date.now(),
//       longSession: wantsLongSession,
//       owner: user(),
//       sessionKey
//     }})
//     if (wantsLongSession) {

//     }
//     else {

//     }
//     return sessionKey
//   }
  
//   return {
//     async login(username: string, password: string, wantsLongSession = false): Promise<false | string> {
//       await delay(Math.round(Math.random() * 10))
//       if (db.user[username] === undefined) {
//         await delay(Math.round(Math.random() * 5))
//         return false
//       }
//       if (await argon2.verify(db.user[username].passwordHash.get(), password)) {
//         return createSession(username, wantsLongSession)
//       }
//     },
//     async authenticate(username: string, sessionKey: string, isLongSession) {
//       // lock an attempt if it was never active on this user
//     }
//   }
// }


// const lel = {}