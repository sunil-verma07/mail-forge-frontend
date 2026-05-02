import { useState, useEffect } from 'react';
import { healthCheck } from '../services/emailApi';

export default function StatusBadge() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    healthCheck()
      .then((data) => setStatus(data.success ? 'healthy' : 'degraded'))
      .catch(() => setStatus('error'));
  }, []);

  const config = {
    checking: { dot: 'bg-yellow-400 animate-pulse', text: 'Checking SMTP…', color: 'text-yellow-400' },
    healthy: { dot: 'bg-emerald-400', text: 'SMTP Connected', color: 'text-emerald-400' },
    degraded: { dot: 'bg-yellow-500 animate-pulse', text: 'SMTP Degraded', color: 'text-yellow-400' },
    error: { dot: 'bg-red-500', text: 'SMTP Offline', color: 'text-red-400' },
  }[status];

  return (
    <div className="flex items-center gap-2 bg-ink-900 border border-ink-800 rounded-full px-3 py-1.5">
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`text-xs font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
}
