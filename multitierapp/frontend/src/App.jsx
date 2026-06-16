import { useEffect, useState } from 'react';

export default function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Loading messages...');
  const [statusType, setStatusType] = useState('info');
  const [isBusy, setIsBusy] = useState(false);

  async function readJsonResponse(response, actionName) {
    const contentType = response.headers.get('content-type') || '';
    const rawBody = await response.text();
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        try {
          const payload = JSON.parse(rawBody);
          throw new Error(payload.error || `${actionName} failed (${response.status})`);
        } catch {
          throw new Error(`${actionName} failed (${response.status})`);
        }
      }
      throw new Error(`${actionName} failed (${response.status})`);
    }

    if (!rawBody) return null;

    if (!isJson) {
      throw new Error('Backend response was not JSON. Make sure API proxy/backend is running.');
    }

    try {
      return JSON.parse(rawBody);
    } catch {
      throw new Error('Received invalid JSON from backend.');
    }
  }

  async function loadMessages() {
    try {
      setIsBusy(true);
      setStatus('Loading messages...');
      setStatusType('info');

      const response = await fetch('/api/messages');
      const data = await readJsonResponse(response, 'Load messages');
      setMessages(data);
      setStatus(`Loaded ${data.length} message(s).`);
      setStatusType('success');
    } catch (err) {
      setMessages([]);
      setStatus(`Could not load messages: ${err.message}`);
      setStatusType('error');
    } finally {
      setIsBusy(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;

    try {
      setIsBusy(true);
      setStatus('Sending message...');
      setStatusType('info');

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value })
      });

      await readJsonResponse(response, 'Send message');

      setText('');
      await loadMessages();
    } catch (err) {
      setStatus(`Could not send message: ${err.message}`);
      setStatusType('error');
    } finally {
      setIsBusy(false);
    }
  }

  async function clearMessages() {
    try {
      setIsBusy(true);
      setStatus('Clearing output...');
      setStatusType('info');

      const response = await fetch('/api/messages', {
        method: 'DELETE'
      });

      await readJsonResponse(response, 'Clear output');

      setMessages([]);
      setStatus('Output cleared successfully.');
      setStatusType('success');
    } catch (err) {
      setStatus(`Could not clear output: ${err.message}`);
      setStatusType('error');
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <main className="app">
      <h1>Multi-Tier Kubernetes App</h1>
      <p>React Frontend {'->'} Node Backend {'->'} MongoDB</p>

      <form onSubmit={sendMessage} className="message-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          type="text"
          placeholder="Type a message"
          disabled={isBusy}
        />
        <button type="submit" disabled={isBusy}>
          Send
        </button>
        <button
          type="button"
          className="secondary"
          onClick={clearMessages}
          disabled={isBusy || messages.length === 0}
        >
          Clear Output
        </button>
      </form>

      <h2>Output Messages</h2>
      <ul className="message-list">
        {messages.length === 0 ? (
          <li className="empty">No messages yet.</li>
        ) : (
          messages.map((message) => <li key={message._id}>{message.text}</li>)
        )}
      </ul>

      <div className={`status ${statusType}`}>{status}</div>
    </main>
  );
}
