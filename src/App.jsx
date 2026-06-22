import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const DUMMY_ENDPOINT = '/api/terminal';

const App = () => {
  const [history, setHistory] = useState([
    { id: 1, text: "Welcome to Ayush Jalan's portfolio terminal.", type: 'info' },
    { id: 2, text: 'Completely vibe coded portfolio — this feels slick and immersive.', type: 'vibe' },
    { id: 3, text: 'Claude Code-style assistant is ready. Send a command below.', type: 'info' },
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Ready when you are!!!');
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const cursorRef = useRef(null);
  const mirrorRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const updateCaret = () => {
      const inputEl = inputRef.current;
      const cursorEl = cursorRef.current;
      const mirrorEl = mirrorRef.current;
      if (!inputEl || !cursorEl || !mirrorEl) return;

      const selectionStart = inputEl.selectionStart ?? inputEl.value.length;
      // Mirror the text up to caret to measure width
      const textBefore = inputEl.value.slice(0, selectionStart) || '';
      // Replace spaces with nbsp so width matches
      mirrorEl.textContent = textBefore.replace(/ /g, '\u00A0');

      // Ensure mirror uses same font metrics as input
      const cs = window.getComputedStyle(inputEl);
      mirrorEl.style.font = cs.font;
      mirrorEl.style.letterSpacing = cs.letterSpacing;
      mirrorEl.style.padding = cs.padding;

      const mirrorWidth = mirrorEl.getBoundingClientRect().width;

      // account for input padding to align caret exactly with text
      const paddingLeft = parseFloat(cs.paddingLeft) || 0;

      // positioning relative to input element using offsetLeft for accuracy
      // subtract paddingLeft so caret sits over characters rather than after padding
      const left = mirrorWidth + inputEl.offsetLeft - inputEl.scrollLeft + 2 - paddingLeft;

      cursorEl.style.left = `${left}px`;
    };

    // update on input and selection changes
    const el = inputRef.current;
    el?.addEventListener('input', updateCaret);
    el?.addEventListener('keydown', updateCaret);
    el?.addEventListener('keyup', updateCaret);
    el?.addEventListener('click', updateCaret);
    el?.addEventListener('scroll', updateCaret);

    // initial update
    updateCaret();

    return () => {
      el?.removeEventListener('input', updateCaret);
      el?.removeEventListener('keydown', updateCaret);
      el?.removeEventListener('keyup', updateCaret);
      el?.removeEventListener('click', updateCaret);
      el?.removeEventListener('scroll', updateCaret);
    };
  }, []);

  useLayoutEffect(() => {
    // Use a bottom sentinel and scroll it into view — more deterministic
    const sentinel = endRef.current;
    const container = outputRef.current;
    if (!container || !sentinel) return;

    const scrollToEnd = () => {
      try {
        sentinel.scrollIntoView({ block: 'end', behavior: 'auto' });
      } catch (e) {
        container.scrollTop = container.scrollHeight;
      }
    };

    // Try after layout settles
    requestAnimationFrame(() => requestAnimationFrame(scrollToEnd));
    const t = setTimeout(scrollToEnd, 50);

    return () => clearTimeout(t);
  }, [history.length]);

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
          <div ref={endRef} aria-hidden="true" />
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

        <div className="terminal-fixed" onClick={focusInput}>
          <div className="terminal-input-row">
            <div className="terminal-input-wrap">
              <span>❯ </span>
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
              <span ref={cursorRef} className="insert-caret" aria-hidden="true" />
              <div ref={mirrorRef} className="input-mirror" aria-hidden="true" />
            </div>
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
    </div>
  );
};

export default App;
