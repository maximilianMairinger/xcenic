import { DataBase } from "josm"
import argon2 from "argon2"
import delay from "delay"
import crypto from "crypto"

type Date = number
type DayTime = number
type TimedDate = number

type Session = {
  created: TimedDate,
  lastActive: TimedDate,
  longSession: boolean,
  owner: User,
  sessionKey: string
}

type User = {
  username: string,
  passwordHash: string,
  created: TimedDate,
  sessions: {
    [sessionKey in string]: Session
  },
  sessionHistory: {
    [sessionKey in string]: Session
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
  },
  session: {
    [sessionKey in string]: Session
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