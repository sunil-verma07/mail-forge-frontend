import { useState, useRef } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecipientInput({ label, value = [], onChange, error, disabled, placeholder }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  function addEmail(raw) {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    if (!emailRegex.test(email)) return;
    if (value.includes(email)) { setInput(''); return; }
    onChange([...value, email]);
    setInput('');
  }

  function handleKeyDown(e) {
    if (['Enter', ',', 'Tab', ' '].includes(e.key)) {
      e.preventDefault();
      addEmail(input);
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  function handleBlur() {
    setFocused(false);
    if (input.trim()) addEmail(input);
  }

  function removeEmail(email) {
    onChange(value.filter((e) => e !== email));
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const emails = pasted.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    const valid = emails.filter(emailRegex.test.bind(emailRegex));
    const unique = [...new Set([...value, ...valid])];
    onChange(unique);
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div
        onClick={() => inputRef.current?.focus()}
        className={`
          min-h-[48px] w-full bg-ink-900 border rounded-xl px-3 py-2 cursor-text
          flex flex-wrap gap-1.5 items-center transition-all duration-200
          ${focused ? 'border-accent-red/70 ring-2 ring-accent-red/20' : 'border-ink-700'}
          ${error ? 'border-red-500/60 ring-2 ring-red-500/10' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {value.map((email) => (
          <span key={email} className="tag-pill animate-scale-in">
            {email}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeEmail(email); }}
                className="ml-0.5 text-ink-400 hover:text-red-400 transition-colors leading-none"
              >
                ×
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={value.length === 0 ? (placeholder || 'Type email and press Enter') : ''}
          className="flex-1 min-w-[180px] bg-transparent outline-none text-sm text-ink-100 placeholder-ink-500 py-0.5"
        />
      </div>
      {error && (
        <p className="field-error">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1L11 10H1L6 1z" fillOpacity=".3"/>
            <path d="M6 4.5v2.5M6 8.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}
      <p className="text-ink-600 text-xs mt-1.5">Press Enter, comma, or space to add</p>
    </div>
  );
}
