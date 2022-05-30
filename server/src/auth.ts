import argon2 from "argon2"
import crypto from "crypto"
import delay from "tiny-delay"
import milliseconds from "milliseconds"


import { Data as DATA, DataSubscription, DataBaseSubscription, DataCollection } from "josm"
import { DataBase as DATABASE } from "josm"
import { setDataDerivativeIndex } from "josm"
import { OptionallyExtendedData, OptionallyExtendedDataBase } from "josm/app/dist/esm/derivativeExtension"

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

import { authenticator } from "otplib"



const secret = authenticator.generateSecret()
console.log("secret", secret)
const token = authenticator.generate(secret)
console.log(authenticator.keyuri("max", "xcenic", secret))

const ExDataBase = parseDataBase(DATABASE)


type AccesRight = object
type OtpSecret = string
type Authenticators = ['usb', 'ble', 'nfc', "internal"][number]
type WebAuthn = {
  publicKey: string
  id: string,
  authenticators: Authenticators[],
  
}

type UserType = {
  username: string,
  password: string,
  created: TimedDate,
  accessRights: {
    read: AccesRight[],
    write: AccesRight[]
  },
  twoFactors: {
    device?: {
      [deviceKey in string]: {
        deviceName: string,
        lastUsed: TimedDate
      }
    },
    otp?: OtpSecret,
    email?: string,
    phone?: string,
    webauthn?: WebAuthn
  },
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



const sessionTimes = {
  long: {
    fromCreation: milliseconds.months(9),
    fromLastAccess: milliseconds.weeks(3)
  },
  short: {
    fromCreation: milliseconds.hours(12),
    fromLastAccess: milliseconds.hours(1)
  }
}

const { DataBase: _DataBase, types: DataBaseTypes } = setDataBaseDerivativeIndex(
  class User extends ExDataBase<UserType> {
    static type: UserType;
    findActiveSession(sessKey: string) {
      return this.sessions[sessKey]
    }
    findExpiredSession(sessKey: string) {
      return this.sessionHistory[sessKey]
    }
    createSession(longSession: boolean = false) {
      const sessionKey = crypto.randomBytes(64).toString("utf-8")
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
    attachSessionInvalidationListener(session_key: DataBase<SessionType> | string) {
      const session = typeof session_key === "string" ? this.findActiveSession(session_key) : session_key
      if (session) {
        const unsub = {
          fromCreation: undefined,
          fromLastAccess: undefined
        }
        for (const from in unsub) {
          const creationDateTimeoutDuration = new Data(0)
          const sub = new DataCollection(session.longSession, session.created).get((longSession, created) => {
            const dur = longSession ? "long" : "short"
            creationDateTimeoutDuration.set(sessionTimes[dur][from] - now() - created)
          })
          const creationDateTimeout = delay(creationDateTimeoutDuration)
          creationDateTimeout.then(() => {
            this.logout(session)
          })
          unsub[from] = () => {
            creationDateTimeout.cancel()
            sub.deactivate()
          }
        }

        session((full) => {
          if (full === undefined) {
            for (const key in unsub) unsub[key]()
          }
        }, false, false)
        return true
      }
      else return false
    }
    logout(session_key: DataBase<SessionType> | string) {
      const session = typeof session_key === "string" ? this.findActiveSession(session_key) : session_key

    }
  }
)



// types



// type DataTypes = {
//   [key in keyof typeof _DataTypes]: typeof _DataTypes[key]
// }

// resolves to...

export type DataTypes = {
  tt: [typeof Password];
  ww: [PasswordType];
}

// export type DataBaseTypes = {
//   [key in keyof typeof DataBaseTypes]: typeof DataBaseTypes[key]
// }

// resolves to...

export type DataBaseTypes = {
  w: [object[], symbol[], boolean[], string[], number[], (string | number | boolean | symbol | object)[]];
  t: [ArrayListClass<object>, ArrayListClass<symbol>, ArrayListClass<boolean>, ArrayListClass<string>, ArrayListClass<number>, ArrayListClass<number | object | symbol | boolean | string>];
}



export type Data<Value, _Default extends Value = Value> = OptionallyExtendedData<DataTypes["tt"], DataTypes["ww"], Value, _Default>
export type DataBase<Store extends object> = OptionallyExtendedDataBase<Store, DataBaseTypes["t"], DataBaseTypes["w"], DataTypes["tt"], DataTypes["ww"]>



export const Data = _Data
export const DataBase = _DataBase





























type Date = number
type DayTime = number
type TimedDate = number

type SessionType = {
  created: TimedDate,
  lastActive: TimedDate,
  longSession: boolean,
  sessionKey: string
}

type User = {
  username: string,
  passwordHash: string,
  created: TimedDate,
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

type AuthDB = DataBase<{
  user: {
    [username in string]: User
  }
}>

export default async function auth(db: AuthDB) {
  db({
    user: {},
    session: {}
  })

  const initState = db()



  function createSession(username: string, wantsLongSession: boolean) {
    const sessionKey = crypto.randomBytes(32).toString("utf-8")
    const user = db.user[username]
    user.sessions({[sessionKey]: {
      created: Date.now(),
      lastActive: Date.now(),
      longSession: wantsLongSession,
      owner: user(),
      sessionKey
    }})
    if (wantsLongSession) {

    }
    else {

    }
    return sessionKey
  }
  
  return {
    async login(username: string, password: string, wantsLongSession = false): Promise<false | string> {
      await delay(Math.round(Math.random() * 10))
      if (db.user[username] === undefined) {
        await delay(Math.round(Math.random() * 5))
        return false
      }
      if (await argon2.verify(db.user[username].passwordHash.get(), password)) {
        return createSession(username, wantsLongSession)
      }
    },
    async authenticate(username: string, sessionKey: string, isLongSession) {
      // lock an attempt if it was never active on this user
    }
  }
}


const lel = {}