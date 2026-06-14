import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// ── 효 시각화 컴포넌트 ────────────────────────────────────────
function YaoSymbol({ lines = [], highlight = null, size = 'md' }) {
  const h = size === 'sm' ? 14 : 20;
  const gap = size === 'sm' ? 3 : 5;
  return (
    <div style={{ display: 'flex', flexDirection: 'column-reverse', gap, alignItems: 'center' }}>
      {lines.map((v, i) => {
        const isHL = highlight === i + 1;
        const color = isHL ? 'var(--gold)' : 'var(--accent-light)';
        return (
          <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {v === 1
              ? <div style={{ width: size==='sm'?36:52, height: h, background: color, borderRadius: 3 }} />
              : <>
                  <div style={{ width: size==='sm'?15:22, height: h, background: color, borderRadius: 3 }} />
                  <div style={{ width: size==='sm'?6:8, height: h }} />
                  <div style={{ width: size==='sm'?15:22, height: h, background: color, borderRadius: 3 }} />
                </>
            }
          </div>
        );
      })}
    </div>
  );
}

// ── 괘 카드 ───────────────────────────────────────────────────
function GuaCard({ label, gua, lines, highlight, badge }) {
  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{label}</span>
        {badge && (
          <span style={{
            fontSize: '0.7rem', background: 'rgba(124,58,237,0.2)',
            color: 'var(--accent-light)', padding: '2px 8px', borderRadius: 20,
          }}>{badge}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
        <YaoSymbol lines={lines} highlight={highlight} />
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2 }}>
            {gua?.name || '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {gua?.guaNo}번괘
          </div>
        </div>
      </div>
      {gua?.dansa && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {gua.dansa}
        </p>
      )}
      {gua?.practical && (
        <p style={{ fontSize: '0.82rem', color: 'var(--accent-light)', lineHeight: 1.6, marginTop: 8 }}>
          💡 {gua.practical}
        </p>
      )}
    </div>
  );
}

// ── 타임라인 ──────────────────────────────────────────────────
function Timeline({ timeline, currentYear }) {
  const korAge = new Date().getFullYear() - currentYear;
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ display: 'flex', gap: 0, minWidth: 'max-content' }}>
        {timeline.map((t, i) => {
          const isCurrent = new Date().getFullYear() >= t.startYear && new Date().getFullYear() <= t.endYear;
          return (
            <div key={i} style={{
              position: 'relative',
              minWidth: t.years * 14,
              padding: '12px 10px',
              borderLeft: '1px solid var(--border)',
              background: isCurrent ? 'rgba(124,58,237,0.12)' : (t.isHucheon ? 'rgba(212,168,67,0.05)' : 'transparent'),
              transition: 'background 0.2s',
            }}>
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'var(--accent)',
                }} />
              )}
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                {t.startAge}~{t.endAge}세
              </div>
              <YaoSymbol lines={[t.yaoType==='yang'?1:0]} size="sm" highlight={null} />
              <div style={{ fontSize: '0.7rem', marginTop: 6, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                {t.gua}괘<br/>{t.yaoPos}효
              </div>
              <div style={{ fontSize: '0.6rem', color: t.yaoType==='yang'?'#818cf8':'#f472b6', marginTop: 2 }}>
                {t.yaoType==='yang'?'양 9년':'음 6년'}
              </div>
              {t.isHucheon && (
                <div style={{ fontSize: '0.55rem', color: 'var(--gold)', marginTop: 2 }}>후천</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 프롬프트 생성기 ───────────────────────────────────────────
function PromptGenerator({ data }) {
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { saju, seoncheon, hucheon, wondang, wondangYao, yunnyeon, timeline, gender, birthYear, currentYear } = data;
  const korAge = currentYear - birthYear + 1;
  const cur = timeline?.find(t => korAge >= t.startAge && korAge <= t.endAge);

  const prompt = `당신은 하락이수(河洛理數) 전문 상담사입니다. 아래 내담자 정보를 바탕으로 구체적인 풀이와 행동 지침, 심리 처방을 제공해 주세요.

━━━━━━━━━━━━━━━━━━━━━━
【 내담자 기본 정보 】
━━━━━━━━━━━━━━━━━━━━━━
성별: ${gender === 'male' ? '남성' : '여성'}
생년: ${birthYear}년
현재 나이: ${korAge}세 (${currentYear}년 기준)
사주팔자: ${saju?.ganji8?.join(' ') || ''}
일간(日干): ${saju?.ganji8?.[4] || ''}

━━━━━━━━━━━━━━━━━━━━━━
【 선천괘 (인생 전반) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${seoncheon?.guaNo}번 ${seoncheon?.name}
괘사: ${seoncheon?.dansa}
상전: ${seoncheon?.sangjeon}
원당효: ${wondang}효
원당효사: ${wondangYao?.text_ko || ''}
원당효 해설: ${wondangYao?.comment_ko || ''}

━━━━━━━━━━━━━━━━━━━━━━
【 후천괘 (인생 후반) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${hucheon?.guaNo}번 ${hucheon?.name}
괘사: ${hucheon?.dansa}
상전: ${hucheon?.sangjeon}

━━━━━━━━━━━━━━━━━━━━━━
【 올해 유년괘 (${currentYear}년) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${yunnyeon?.guaNo}번 ${yunnyeon?.name} ${yunnyeon?.yaoPos}효
효사: ${yunnyeon?.yaoData?.text_ko || ''}
해설: ${yunnyeon?.yaoData?.comment_ko || ''}

━━━━━━━━━━━━━━━━━━━━━━
【 현재 대운 】
━━━━━━━━━━━━━━━━━━━━━━
${cur ? `${cur.startAge}세~${cur.endAge}세 / ${cur.gua}번괘 ${cur.yaoPos}효 (${cur.yaoType==='yang'?'양효 9년':'음효 6년'} 지배)` : ''}

━━━━━━━━━━━━━━━━━━━━━━
【 풀이 요청 사항 】
━━━━━━━━━━━━━━━━━━━━━━
${question || `위 정보를 바탕으로 다음을 풀이해 주세요:
1. 선천괘와 원당효를 통한 핵심 성향 및 인생 전반의 흐름
2. 후천괘를 통한 인생 후반의 방향성
3. 올해(${currentYear}년) 유년괘 기반 구체적 행동 지침
4. 현재 대운 에너지에서 해야 할 일과 피해야 할 일
5. 심리 처방 한 마디`}`;

  const copy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 6 }}>🤖 Claude 심층 상담 프롬프트</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
        아래 버튼으로 프롬프트를 복사한 뒤 <strong>claude.ai</strong> 대화창에 붙여넣으세요.
        추가 질문을 입력하면 맞춤 프롬프트가 생성됩니다.
      </p>
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="추가 질문을 입력하세요 (예: 이직해도 될까요? / 올해 사업을 시작해도 될까요?)"
        rows={3}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--surface2)',
          color: 'var(--text)', fontSize: '0.9rem', resize: 'vertical', outline: 'none',
          marginBottom: 12,
        }}
      />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={copy} style={{
          flex: 1, padding: '12px 0', borderRadius: 10,
          background: copied ? '#16a34a' : 'var(--accent)',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: '0.95rem', transition: 'background 0.3s',
        }}>
          {copied ? '✓ 복사됨!' : '📋 프롬프트 복사'}
        </button>
        <a
          href="https://claude.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '12px 20px', borderRadius: 10,
            border: '1px solid var(--border)', color: 'var(--text-muted)',
            textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center',
          }}
        >
          Claude 열기 ↗
        </a>
      </div>
      <details style={{ marginTop: 16 }}>
        <summary style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          프롬프트 미리보기
        </summary>
        <pre style={{
          marginTop: 10, padding: 14, background: 'var(--surface2)',
          borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-muted)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6,
          maxHeight: 300, overflowY: 'auto',
        }}>{prompt}</pre>
      </details>
    </div>
  );
}

// ── 메인 결과 페이지 ──────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!router.isReady) return;
    const { year, month, day, hour, gender, calType, isYajasiNext } = router.query;
    if (!year) return;

    fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: Number(year), month: Number(month), day: Number(day),
        hour: Number(hour), gender, calType,
        isYajasiNext: isYajasiNext === '1',
      }),
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [router.isReady]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ fontSize: '3rem' }}>☯</div>
      <p style={{ color: 'var(--text-muted)' }}>사주를 괘로 변환하는 중...</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {['천간수', '지지수', '선천괘', '원당효', '후천괘'].map((s, i) => (
          <span key={i} style={{
            fontSize: '0.75rem', padding: '4px 10px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 20, color: 'var(--text-muted)',
            animation: `fadeIn 0.4s ease ${i * 0.2}s both`,
          }}>{s}</span>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
        <p style={{ color: '#f87171', marginBottom: 16 }}>계산 중 오류가 발생했습니다: {error}</p>
        <Link href="/input" style={{ color: 'var(--accent-light)' }}>← 다시 입력하기</Link>
      </div>
    </div>
  );

  if (!data) return null;

  const { saju, suri, seoncheon, hucheon, wondang, wondangYao, yunnyeon, timeline, gender, birthYear, currentYear, lines } = data;
  const korAge = currentYear - birthYear + 1;
  const cur = timeline?.find(t => korAge >= t.startAge && korAge <= t.endAge);

  const TABS = [
    { id: 'overview', label: '개요' },
    { id: 'seoncheon', label: '선천괘' },
    { id: 'hucheon', label: '후천괘' },
    { id: 'yunnyeon', label: `${currentYear}년 운` },
    { id: 'timeline', label: '대운 흐름' },
    { id: 'suri', label: '수리 계산' },
  ];

  return (
    <>
      <Head><title>풀이 결과 — 하락이수</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* 헤더 */}
        <header style={{ borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>河洛理數</Link>
          <Link href="/input" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← 다시 입력</Link>
        </header>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

          {/* 기본 정보 배너 */}
          <div className="card" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>사주팔자</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['연주','월주','일주','시주'].map((label, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2, color: i===2?'var(--gold)':'var(--text)' }}>
                      {saju?.ganji8?.[i*2]}<br/>{saju?.ganji8?.[i*2+1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: 40, width: 1, background: 'var(--border)' }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>수리</p>
              <p style={{ fontWeight: 700 }}>천수 <span style={{ color: 'var(--accent-light)' }}>{suri?.cheonsu}</span> · 지수 <span style={{ color: '#f472b6' }}>{suri?.jisu}</span></p>
            </div>
            <div style={{ height: 40, width: 1, background: 'var(--border)' }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{gender === 'male' ? '남성' : '여성'} · {birthYear}년생 · {korAge}세</p>
              <p style={{ fontWeight: 700 }}>일간(日干) <span style={{ color: 'var(--gold)' }}>{saju?.ganji8?.[4]}</span></p>
            </div>
          </div>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '8px 16px', borderRadius: 8, whiteSpace: 'nowrap',
                border: `1px solid ${activeTab===t.id?'var(--accent)':'var(--border)'}`,
                background: activeTab===t.id?'rgba(124,58,237,0.2)':'transparent',
                color: activeTab===t.id?'var(--accent-light)':'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.9rem',
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── 개요 탭 ── */}
          {activeTab === 'overview' && (
            <div className="fade-up">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                <GuaCard
                  label="선천괘 · 인생 전반"
                  gua={{ ...seoncheon, guaNo: seoncheon?.guaNo }}
                  lines={lines?.sc || []}
                  highlight={wondang}
                  badge={`원당효 ${wondang}효`}
                />
                <GuaCard
                  label="후천괘 · 인생 후반"
                  gua={{ ...hucheon, guaNo: hucheon?.guaNo }}
                  lines={lines?.hc || []}
                />
              </div>

              {/* 올해 운 요약 */}
              <div className="card" style={{ marginBottom: 24, borderColor: 'var(--gold)', borderWidth: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: 8, letterSpacing: '0.1em' }}>
                  올해 {currentYear}년 유년괘
                </p>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <YaoSymbol lines={lines?.sc || []} highlight={yunnyeon?.yaoPos} />
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                      {yunnyeon?.name} {yunnyeon?.yaoPos}효
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
                      {yunnyeon?.yaoData?.text_ko || yunnyeon?.dansa}
                    </p>
                    {yunnyeon?.yaoData?.comment_ko && (
                      <p style={{ color: 'var(--accent-light)', fontSize: '0.82rem', marginTop: 6 }}>
                        💡 {yunnyeon.yaoData.comment_ko}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 프롬프트 생성기 */}
              <PromptGenerator data={data} />
            </div>
          )}

          {/* ── 선천괘 탭 ── */}
          {activeTab === 'seoncheon' && (
            <div className="fade-up">
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20 }}>
                  <YaoSymbol lines={lines?.sc || []} highlight={wondang} />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>선천괘 · 인생 전반</p>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{seoncheon?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{seoncheon?.guaNo}번괘 · 원당효 {wondang}효</p>
                  </div>
                </div>
                {[
                  { label: '괘사(卦辭)', text: seoncheon?.dansa },
                  { label: '상전(象傳)', text: seoncheon?.sangjeon },
                  { label: '실용 해석', text: seoncheon?.practical },
                  { label: '주의사항', text: seoncheon?.caution },
                ].map(row => row.text && (
                  <div key={row.label} style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{row.label}</p>
                    <p style={{ lineHeight: 1.8 }}>{row.text}</p>
                  </div>
                ))}
              </div>

              {/* 원당효 */}
              {wondangYao && (
                <div className="card" style={{ borderColor: 'var(--gold)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: 10 }}>원당효(元堂爻) · {wondang}효</p>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>{wondangYao.text_ko}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{wondangYao.comment_ko}</p>
                </div>
              )}
            </div>
          )}

          {/* ── 후천괘 탭 ── */}
          {activeTab === 'hucheon' && (
            <div className="fade-up">
              <div className="card">
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20 }}>
                  <YaoSymbol lines={lines?.hc || []} />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>후천괘 · 인생 후반</p>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{hucheon?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{hucheon?.guaNo}번괘</p>
                  </div>
                </div>
                {[
                  { label: '괘사(卦辭)', text: hucheon?.dansa },
                  { label: '상전(象傳)', text: hucheon?.sangjeon },
                  { label: '실용 해석', text: hucheon?.practical },
                  { label: '주의사항', text: hucheon?.caution },
                ].map(row => row.text && (
                  <div key={row.label} style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{row.label}</p>
                    <p style={{ lineHeight: 1.8 }}>{row.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 유년괘 탭 ── */}
          {activeTab === 'yunnyeon' && (
            <div className="fade-up">
              <div className="card" style={{ borderColor: 'var(--gold)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: 12, letterSpacing:'0.1em' }}>
                  {currentYear}년 유년괘
                </p>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20 }}>
                  <YaoSymbol lines={lines?.sc || []} highlight={yunnyeon?.yaoPos} />
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{yunnyeon?.name} {yunnyeon?.yaoPos}효</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{yunnyeon?.guaNo}번괘 · 현재 {korAge}세</p>
                  </div>
                </div>
                {yunnyeon?.dansa && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>괘사</p>
                    <p style={{ lineHeight: 1.8 }}>{yunnyeon.dansa}</p>
                  </div>
                )}
                {yunnyeon?.yaoData?.text_ko && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>효사</p>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>{yunnyeon.yaoData.text_ko}</p>
                    <p style={{ color: 'var(--accent-light)', lineHeight: 1.7 }}>{yunnyeon.yaoData.comment_ko}</p>
                  </div>
                )}
                {cur && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>현재 대운 구간</p>
                    <p>{cur.startAge}세 ~ {cur.endAge}세 ({cur.yaoType==='yang'?'양효 9년':'음효 6년'} 지배)</p>
                  </div>
                )}
              </div>
              <PromptGenerator data={data} />
            </div>
          )}

          {/* ── 타임라인 탭 ── */}
          {activeTab === 'timeline' && (
            <div className="fade-up">
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>평생 대운 타임라인</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                  양효(—)는 9년, 음효(--)는 6년간 지배합니다. 현재 구간은 보라색으로 표시됩니다.
                </p>
                <Timeline timeline={timeline || []} currentYear={birthYear} />
              </div>

              {/* 상세 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {timeline?.map((t, i) => {
                  const isCur = new Date().getFullYear() >= t.startYear && new Date().getFullYear() <= t.endYear;
                  return (
                    <div key={i} className="card" style={{
                      display: 'flex', gap: 16, alignItems: 'center',
                      borderColor: isCur ? 'var(--accent)' : 'var(--border)',
                      background: isCur ? 'rgba(124,58,237,0.1)' : 'var(--surface)',
                    }}>
                      <YaoSymbol lines={[t.yaoType==='yang'?1:0]} size="sm" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700 }}>{t.startAge}~{t.endAge}세</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.startYear}~{t.endYear})</span>
                          {isCur && <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: '#fff', padding: '1px 8px', borderRadius: 20 }}>현재</span>}
                          {t.isHucheon && <span style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>후천</span>}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {t.gua}번괘 {t.yaoPos}효 · {t.yaoType==='yang'?'양효 9년':'음효 6년'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 수리 계산 탭 ── */}
          {activeTab === 'suri' && (
            <div className="fade-up">
              <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>수리 변환 과정</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {['연간','월간','일간','시간'].map((label, i) => {
                    const g = saju?.ganji8?.[i*2];
                    return (
                      <div key={i} style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label} {g}</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>
                          {suri?.chunganList?.[i]?.su ?? '-'}
                        </span>
                      </div>
                    );
                  })}
                  {['연지','월지','일지','시지'].map((label, i) => {
                    const j = saju?.ganji8?.[i*2+1];
                    return (
                      <div key={i} style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label} {j}</span>
                        <span style={{ fontWeight: 700, color: '#f472b6' }}>
                          {suri?.jijiList?.[i]?.su ?? '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', gap: 20 }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>천수 (홀수 합)</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-light)' }}>{suri?.cheonsu}</p>
                  </div>
                  <div style={{ fontSize: '1.5rem', alignSelf: 'center', color: 'var(--text-muted)' }}>+</div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>지수 (짝수 합)</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f472b6' }}>{suri?.jisu}</p>
                  </div>
                  <div style={{ fontSize: '1.5rem', alignSelf: 'center', color: 'var(--text-muted)' }}>=</div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>합계</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{(suri?.cheonsu||0)+(suri?.jisu||0)}</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--text)' }}>선천괘 도출:</strong> {gender==='male'?'천':'지'}수 {suri?.csF} ÷ 8 = 나머지 {(suri?.csF||0)%8||8} → 상괘(외괘) · {gender==='male'?'지':'천'}수 {suri?.jsF} ÷ 8 = 나머지 {(suri?.jsF||0)%8||8} → 하괘(내괘)<br/>
                    <strong style={{ color: 'var(--text)' }}>원당효 도출:</strong> ({suri?.cheonsu}+{suri?.jisu}) ÷ 6 = 나머지 {((suri?.cheonsu||0)+(suri?.jisu||0))%6||6} → {wondang}효
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
