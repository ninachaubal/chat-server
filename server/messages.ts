import { getUsernameFromSession } from './sessions'

type Message = {
  username: string,
  message: string,
}

const getMessageFromDoc = async (db, doc) => ({
  // get current username from sessionId since these can change
  username: await getUsernameFromSession(db, doc.sessionId),
  message: doc.message,
}) as Message

export const getMessages = (db, sessionId) => {
  return new Promise<Message[]>((resolve, reject) => {
    db.messages.find({}).sort({ createdAt: 1}).exec((err, docs) => {
      if (err) {
        console.log('db.messages.getMessages', err)
        reject(err)
      } else {
        const messages = Promise.all(docs.map((doc) => getMessageFromDoc(db, doc)));
        resolve(messages)
      }
    })
  });
}

export const addMessage = async (db, sessionId, message) => {
  // Save messages with sessionId since usernames can change
  await db.messages.insert({
    sessionId: sessionId,
    message,
    createdAt: Date.now(),
  }, (err) => {
    console.log('db.messages.newmessage', err)
  })
}