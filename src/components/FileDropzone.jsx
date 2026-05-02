import { useDropzone } from 'react-dropzone';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const FILE_ICONS = {
  'application/pdf': '📄',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({ files, onChange, disabled }) {
  const onDrop = (accepted, rejected) => {
    if (accepted.length) {
      onChange([...files, ...accepted]);
    }
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 10,
    disabled,
  });

  function removeFile(idx) {
    onChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="label">Attachments</label>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive
            ? 'border-accent-red/70 bg-accent-red/5 scale-[1.01]'
            : 'border-ink-700 hover:border-ink-500 bg-ink-900/50 hover:bg-ink-900'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`text-3xl transition-transform duration-300 ${isDragActive ? 'scale-125' : ''}`}>
            {isDragActive ? '📨' : '📎'}
          </div>
          <div>
            <p className="text-ink-200 text-sm font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-ink-500 text-xs mt-1">
              or <span className="text-accent-red">browse files</span> · PDF, PNG, JPG, DOCX · Max 5MB each
            </p>
          </div>
        </div>
      </div>

      {/* Rejection errors */}
      {fileRejections.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <p key={file.name} className="field-error">
              <span>⚠</span>
              {file.name}: {errors.map((e) => e.message).join(', ')}
            </p>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center gap-3 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2.5 animate-slide-up"
            >
              <span className="text-lg">{FILE_ICONS[file.type] || '📁'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ink-100 text-sm font-medium truncate">{file.name}</p>
                <p className="text-ink-500 text-xs">{formatBytes(file.size)}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-ink-500 hover:text-red-400 transition-colors text-lg leading-none ml-1"
                  title="Remove"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
