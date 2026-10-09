import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        width: '100vw', height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0d0f14', color: '#e8eaf0', gap: '16px',
        padding: '24px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#8b92a8', fontSize: '14px', maxWidth: '400px' }}>
          {this.state.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #f5c842, #f97316)',
            color: '#000', fontWeight: 700, fontSize: '14px',
            border: 'none', cursor: 'pointer'
          }}
        >
          Reload Game
        </button>
      </div>
    );
  }
}
