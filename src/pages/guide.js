import Head from 'next/head';
import Link from 'next/link';

const STEPS = [
  {
    no: '01',
    title: '사주명리학 기초',
    sub: '기초 체력 다지기',
    color: '#818cf8',
    icon: '🌱',
    duration: '1~3개월',
    items: [
      '10천간과 12지지 암기',
      '오행(五行)의 상생·상극 원리',
      '사주팔자 세우는 법 (만세력 보는 법)',
      '일간(日干) 개념 이해',
    ],
    goal: '다른 사람의 사주를 보고 "무슨 일간에 어떤 글자들이 있구나"를 읽을 수 있는 수준',
    books: ['《사주명리학 완전정복》 (안도균 저)', '《명리학 입문》 (박주현 저)'],
  },
  {
    no: '02',
    title: '주역 64괘 이해',
    sub: '구조 파악',
    color: '#34d399',
    icon: '☯',
    duration: '2~4개월',
    items: [
      '8개 기본 괘(팔괘)의 성질과 상징',
      '64괘의 이름과 스토리라인',
      '효(爻)의 음양 구조 파악',
      '괘사·효사 원문 읽기 연습',
    ],
    goal: '괘의 모양만 보고도 이름이 즉시 떠오르는 수준. 64괘 사전을 적극 활용하세요.',
    books: ['《주역》 (김석진 역해, 대유학당)', '《주역강의》 (심의용 저)'],
  },
  {
    no: '03',
    title: '하락이수 수리 계산법',
    sub: '공식 마스터',
    color: '#f59e0b',
    icon: '🔢',
    duration: '1~2개월',
    items: [
      '하도·낙서의 수리 원리',
      '천간수·지지수 변환표 암기',
      '천수(홀수 합)·지수(짝수 합) 산출',
      '선천괘·후천괘·원당효 도출 공식',
      '윤달 처리법과 야자시 처리법',
    ],
    goal: '이 사이트의 "수리 계산" 탭 결과를 보고 손으로 검증할 수 있는 수준',
    books: ['《하락이수》 (김석진 저, 대유학당)', '《하락이수 정해》 (신수훈 저, 명문당)'],
  },
  {
    no: '04',
    title: '원문 해석 & 임상 실습',
    sub: '실전 연습',
    color: '#f472b6',
    icon: '🧪',
    duration: '6개월~',
    items: [
      '하락이수 원문(효사) 현대적 해석',
      '본인·가족 사주 직접 대입 검증',
      '유명인 사주와 역사적 사건 대조',
      'Claude 심층 상담 프롬프트 활용',
      '행동 지침·심리 처방 리딩 연습',
    ],
    goal: '과거 굵직한 사건들이 그 나이대 괘·효와 실제로 맞물렸는지 임상으로 확인',
    books: ['역사 속 인물 가상 풀이 분석', 'Claude AI 심층 상담 연계 활용'],
  },
];

const TIPS = [
  {
    icon: '⚠️',
    title: '가장 흔한 실수',
    text: '3단계 수리 계산에 너무 매몰되어 지치는 것. 공식은 이 사이트가 자동 처리해 줍니다. "내 에너지가 어떤 주역 스토리(괘)로 변하는가"라는 큰 틀의 재미를 먼저 느끼세요.',
  },
  {
    icon: '💡',
    title: '가장 빠른 학습법',
    text: '본인 사주를 이 사이트에 입력하고 결과를 먼저 확인한 뒤, 거꾸로 계산 과정을 이해하는 것. 내 괘가 무엇인지 알면 책이 훨씬 재미있게 읽힙니다.',
  },
  {
    icon: '🔄',
    title: '하락이수 활용 주기',
    text: '연 1회(입춘 전후) 유년괘 정기 확인 + 인생의 중대한 변곡점(이직·창업·투자·결혼)마다 수시 복기. 매일 보는 점술 도구가 아닙니다.',
  },
];

export default function GuidePage() {
  return (
    <>
      <Head><title>공부 로드맵 — 하락이수</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        <header style={{ borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>河洛理數</Link>
          <Link href="/input" style={{ fontSize: '0.85rem', color: 'var(--accent-light)', textDecoration: 'none' }}>풀이 시작 →</Link>
        </header>

        <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px' }}>

          <p style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: 12 }}>STUDY ROADMAP</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>하락이수 공부 로드맵</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 48 }}>
            하락이수는 사주명리학·주역·수리 계산을 모두 융합한 동양 철학의 최상급 코스입니다.
            독학으로 길을 잃지 않도록 4단계 로드맵을 정리했습니다.
          </p>

          {/* 4단계 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 60 }}>
            {STEPS.map((step, i) => (
              <div key={i} className="card fade-up" style={{
                animationDelay: `${i * 0.1}s`,
                borderLeft: `3px solid ${step.color}`,
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `${step.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: step.color, fontWeight: 700, letterSpacing: '0.1em' }}>
                        STEP {step.no}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 20 }}>
                        {step.duration}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 2 }}>{step.title}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.sub}</p>
                  </div>
                </div>

                {/* 학습 내용 */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {step.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.9rem' }}>
                      <span style={{ color: step.color, marginTop: 1, flexShrink: 0 }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* 목표 */}
                <div style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: 10, marginBottom: 14 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>🎯 단계 목표</p>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>{step.goal}</p>
                </div>

                {/* 추천 교재 */}
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>📚 추천 교재</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {step.books.map((b, j) => (
                      <span key={j} style={{
                        fontSize: '0.78rem', padding: '4px 10px',
                        border: '1px solid var(--border)', borderRadius: 20,
                        color: 'var(--text-muted)',
                      }}>{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 팁 3가지 */}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>공부할 때 꼭 알아야 할 것들</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 60 }}>
            {TIPS.map((tip, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{tip.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>{tip.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{tip.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.95rem' }}>
              이론을 배우기 전에 내 괘부터 확인해 보세요.<br/>
              결과를 알고 나면 공부가 10배 재미있어집니다.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/input" style={{
                display: 'inline-block', background: 'var(--accent)',
                color: '#fff', padding: '14px 36px', borderRadius: 10,
                fontWeight: 700, textDecoration: 'none', fontSize: '1rem',
              }}>
                내 괘 확인하기 →
              </Link>
              <Link href="/gua-dictionary" style={{
                display: 'inline-block', border: '1px solid var(--border)',
                color: 'var(--text-muted)', padding: '14px 36px', borderRadius: 10,
                fontWeight: 600, textDecoration: 'none', fontSize: '1rem',
              }}>
                64괘 사전 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
