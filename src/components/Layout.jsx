import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Navbar />
      <main style={{ padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  );
}