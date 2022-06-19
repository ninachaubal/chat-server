import React, { useState } from 'react'

export default ({sendMessage}: {sendMessage: (message: string) => void}) => {
  const [message, setMessage] = useState<string>('');

  const handleSend = (e: any) => {
    e.preventDefault()
    sendMessage(message)
    setMessage('')
  }

  return (
    <>
      <form className='bg-sky-200 p-4 rounded flex' onSubmit={handleSend}>
        <input 
          className='w-full px-4 rounded' 
          id="message" 
          type="text" 
          onChange={e => setMessage(e.target.value)}
          value={message}
        />
        <button className='bg-sky-50 ml-4 p-2 rounded' type="submit">Send</button>
      </form>
    </>
  );
}

