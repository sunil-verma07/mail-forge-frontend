import { useEffect, useRef } from 'react';

export default function EmailPreviewModal({ html, onClose }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-ink-900 border border-ink-700 rounded-t-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">👁️</span>
            <div>
              <h3 className="font-display font-bold text-ink-100 text-base">Email Preview</h3>
              <p className="text-ink-500 text-xs">This is how your email will look to recipients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-100 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-700"
          >
            ×
          </button>
        </div>

        {/* Device switcher bar */}
        <div className="bg-ink-800 border-x border-ink-700 px-5 py-2.5 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-1 text-xs text-ink-400 text-center font-mono">
              Email Preview
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-[#f0f4f8] border border-ink-700 rounded-b-2xl">
          {html ? (
            <iframe
              ref={iframeRef}
              title="Email Preview"
              sandbox="allow-same-origin"
              className="w-full h-[600px] border-none"
            />
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <div className="text-4xl mb-3 animate-pulse">⏳</div>
                <p className="text-ink-600 text-sm">Generating preview…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
