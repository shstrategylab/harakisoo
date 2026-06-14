import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>하락이수 — 주역으로 읽는 인생 지도</title>
        <meta name="description" content="하락이수 AI 자동 풀이 서비스. 생년월일시를 입력하면 선천괘·후천괘·유년괘를 즉시 도출합니다." />
      </Head>

      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* 헤더 */}
        <header style={{
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>
            河洛理數
          </span>
          <nav style={{ display: 'flex', gap: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link href="/input" style={{ color: 'inherit', textDecoration: 'none' }}>풀이 시작</Link>
            <Link href="/gua-dictionary" style={{ color: 'inherit', textDecoration: 'none' }}>64괘 사전</Link>
            <Link href="/guide" style={{ color: 'inherit', textDecoration: 'none' }}>공부 로드맵</Link>
          </nav>
        </header>

        {/* 히어로 */}
        <section style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '100px 24px 80px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.2em', marginBottom: 20 }}>
            河洛理數 · 하락이수
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.25,
            marginBottom: 24,
          }}>
            사주를 넣으면<br />
            <span style={{ color: 'var(--accent-light)' }}>64괘로 펼쳐지는</span><br />
            나의 인생 지도
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 48 }}>
            하락이수는 생년월일시를 주역의 64괘·384효로 변환해<br />
            선천운과 후천운, 나이별 대운을 정밀하게 추적하는<br />
            동양 운명학의 최고급 시스템입니다.
          </p>
          <Link href="/input" style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: '#fff',
            padding: '16px 48px',
            borderRadius: 12,
            fontSize: '1.05rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}>
            풀이 시작하기 →
          </Link>
        </section>

        {/* 3대 특징 */}
        <section style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 24px 100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {[
            {
              icon: '☯',
              title: '선천·후천 이원 분석',
              desc: '인생 전반을 지배하는 선천괘와 후반을 지배하는 후천괘를 각각 도출해 인생의 큰 흐름을 이원화합니다.',
            },
            {
              icon: '📅',
              title: '9년·6년 나이별 추적',
              desc: '양효(9년)·음효(6년) 주기로 나이가 들수록 효를 한 칸씩 올라가며 그때그때의 길흉을 읽어냅니다.',
            },
            {
              icon: '📜',
              title: 'Claude 심층 상담 연계',
              desc: '기본 풀이 외 복잡한 해석이 필요한 경우, 자동 생성된 프롬프트를 Claude에 붙여넣어 심층 상담을 받습니다.',
            },
          ].map((item, i) => (
            <div key={i} className="card fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA 배너 */}
        <section style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: '0.9rem' }}>
            조선 왕실과 고위 사대부들이 비밀리에 사용한 운명학
          </p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 28 }}>
            생년월일시만 알면 즉시 시작할 수 있습니다
          </h2>
          <Link href="/input" style={{
            display: 'inline-block',
            border: '1px solid var(--accent)',
            color: 'var(--accent-light)',
            padding: '14px 40px',
            borderRadius: 10,
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            무료로 풀이하기
          </Link>
        </section>

        <footer style={{
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}>
          © 2025 하락이수. 본 서비스는 학습·연구 목적으로 제공됩니다.
        </footer>
      </main>
    </>
  );
}
