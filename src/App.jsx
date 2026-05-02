import { Toaster } from 'react-hot-toast';
import ComposePage from './pages/ComposePage';

export default function App() {
  return (
    <>
      <ComposePage />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1c26',
            border: '1px solid #2a2e3e',
            color: '#e1e3eb',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '13px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#1a1c26' },
          },
          error: {
            iconTheme: { primary: '#e94560', secondary: '#1a1c26' },
          },
        }}
      />
    </>
  );
}
