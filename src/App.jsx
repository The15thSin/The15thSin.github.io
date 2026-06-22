import { useEffect, useRef, useState } from 'react';

const DUMMY_ENDPOINT = '/api/terminal';

const App = () => {
  const [history, setHistory] = useState([
    { id: 1, text: "Welcome to Ayush Jalan's portfolio terminal.", type: 'info' },
    { id: 2, text: 'Completely vibe coded portfolio — this feels slick and immersive.', type: 'vibe' },
    { id: 3, text: 'Claude Code-style assistant is ready. Send a command below.', type: 'info' },
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Ready');
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const addHistory = (text, type = 'command') => {
    setHistory((current) => [...current, { id: Date.now(), text, type }]);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const command = input.trim();
    addHistory(`ayush@portfolio:~$ ${command}`, 'command');
    setInput('');
    setStatus('Sending...');

    try {
      await fetch(DUMMY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      addHistory(`Sent to ${DUMMY_ENDPOINT} (dummy endpoint).`, 'info');
    } catch (error) {
      addHistory('Error: Unable to reach backend endpoint.', 'error');
    } finally {
      setStatus('Ready');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setHistory([]);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="terminal-shell fullscreen">
      <div className="terminal-header">
        <div className="banner-box">
          <pre className="banner-text">
{`╭─── Ayush Vibe Codes v1 ─────────────────────────────────────────╮
│                                    │ Tips for getting started...         |
│    Welcome back for Ayush Jalan.   │ Run /info to view resume.md,        |
│                                    │  or /help if you're feeling lost.   |
│               /\\_/|                │                                     |
│              ( -.- )               │ This portfolio was 100% vibe coded. |
│               z z z                │ 0% planning, 100% confidence.       |
│                                    │                                     │
│         Software Engineer          │ Still under construction...         |
│      ~/ayushjalan/portfolio        │ Why? Because credits ran out... ;)  |
╰──────────────────────────────────────────────────────────────╯`}</pre>
        </div>
      </div>

      <div className="terminal-body">
        <div className="terminal-output" ref={outputRef}>
          {history.map((entry) => (
            <div key={entry.id} className={`terminal-line ${entry.type}`}>
              {entry.text}
            </div>
          ))}
        </div>

        <div className="terminal-panel">
          <div className="panel-row">
            <span className="panel-label">assistant</span>
            <span className="panel-chip">context</span>
          </div>
          <pre className="code-block">
{`# sample command list
help       Display available actions
status     Show current session status
deploy     Mock deployment flow`}
          </pre>
        </div>

        <div className="terminal-input-row" onClick={focusInput}>
          <div className="input-label">
            <span className="prompt">ayush@portfolio:~$</span>
          </div>
          <input
            ref={inputRef}
            className="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            spellCheck="false"
            aria-label="Terminal command input"
          />
        </div>

        <div className="terminal-actions">
          <button className="action-button" type="button" onClick={handleSubmit}>
            Send
          </button>
          <button className="action-button" type="button" onClick={handleClear}>
            Clear
          </button>
          <button className="action-button" type="button" onClick={focusInput}>
            Focus
          </button>
          <span className="status-label">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
