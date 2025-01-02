'use client';

import { useState } from 'react';

export default function SendDMPage() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('/api/discord/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('Message sent successfully!');
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setStatus('An unexpected error occurred.');
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Send DM to Discord User</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <button type="submit">Send DM</button>
      </form>
      <p>{status}</p>
    </div>
  );
}