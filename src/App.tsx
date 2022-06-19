import React, { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import Cookies from 'universal-cookie';
import MessageInput from './components/MessageInput'
import Messages, { Message } from './components/Messages'
const cookies = new Cookies()

export default () => {
  const [socket, setSocket] = useState<Socket>()
  const [username, setUsername] = useState<string>()
  const [sessionId, setSessionId] = useState<string>(cookies.get('session'))
  const [messages, setMessages] = useState<Message[]>([])
  const [hasExited, setHasExited] = useState<boolean>(false)

  useEffect(() => {
    // socket io connection with existing sessionId from cookie if available
    const socket = io('ws://localhost:3030/', { autoConnect: false })
    socket.auth = { sessionId }
    socket.connect()
    setSocket(socket);
  }, [])

  useEffect(() => {
    if(socket) {
      // get session data from server
      socket.on('session', (session) => {
        setUsername(session.username)
        setSessionId(session.sessionId)
        cookies.set('session', session.sessionId, { path: '/' })
      })
    }
  }, [socket])

  useEffect(() => {
    if (socket) {
      // get message feed from server
      socket.on('message feed', (data) => {
        setMessages([...messages, ...data])
      })
    }
  }, [socket, messages])

  const handleMessageSend=(message: string) => {
    if (!message.startsWith('/')) {
      socket.emit('chat message', message)
    } else {
      // handle commands
      const args = message.split(' ');
      if (args[0] === '/name') {
        socket.emit('change name', args[1])
      } else if (args[0] === '/exit') {
        socket.emit('exit')
        setHasExited(true)
      } else if (args[0] === '/color') {
        // check valid color
        if (/^#[0-9a-f]6$/.test(args[1])) {
          socket.emit('color change', args[1])
        }
      } else {
        console.log('command not implemented', message)
      }
    }
  }

  return (
    <>
      { hasExited && (
        <div className="container mx-auto">
          Please close this window.
        </div>
      )}
      { !hasExited && (
        <div className="container mx-auto w-1/2 flex flex-col h-screen">
          <Messages messages={messages} />
          <MessageInput sendMessage={handleMessageSend} />
        </div>
      )}
    </>
  );
}


