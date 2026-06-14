import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>☯</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>페이지를 찾을 수 없습니다</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>괘가 없는 길입니다. 돌아가세요.</p>
      <Link href="/" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>← 홈으로</Link>
    </div>
  );
}
