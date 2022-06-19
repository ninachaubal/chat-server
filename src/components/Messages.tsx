import React from 'react'
import ScrollToBottom from 'react-scroll-to-bottom';

export type Message = {
  username: string,
  message: string,
}

export default ({ messages }: { messages: Message[]}) => {
  return (
    <ScrollToBottom className='bg-slate-300 p-4 rounded grow overflow-scroll'>
      {messages.map(({username, message}) => (
        <p className='py-2'>
          <b>{username}</b>
          <span className='rounded p-4'>{message}</span>
        </p>
      ))}
    </ScrollToBottom>
  );
}
