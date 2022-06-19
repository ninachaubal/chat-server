import { faker } from '@faker-js/faker'

type Session = {
  sessionId: string,
  username: string,
}

export const getSession = (db, sessionId) => {
  return new Promise<Session>((resolve, reject) => {
    db.sessions.findOne({ sessionId }, (err, doc) => {
      if (err) {
        console.log('db.sessions.getSession', err)
        reject(err)
      } else {
        resolve(doc as Session)
      }
    })
  })
}

export const createNewSession = async (db) => {
    const session = {
      sessionId: faker.random.alphaNumeric(16),
      username: `${faker.internet.userName()}`
    }
    db.sessions.insert(session, (err) => {
      console.log('db.sessions.createNewSession', err)
    })
    return session as Session
}

export const getUsernameFromSession = async (db, sessionId) => {
  const session = await getSession(db, sessionId);
  if (session) {
    return session.username
  }
  return null;
}

export const updateUsername = async (db, sessionId, username) => {
  db.sessions.update({ sessionId }, { $set: { username }}, (err) => {
    console.log('db.sessions.updateUsername', err)
  })
}