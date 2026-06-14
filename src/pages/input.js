import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const STEPS = ['성별', '생년월일', '태어난 시각', '확인'];

const HOUR_OPTIONS = [
  { label: '모름 (12시로 처리)', value: 12 },
  { label: '자시 (23:00~01:00)', value: 0 },
  { label: '축시 (01:00~03:00)', value: 1 },
  { label: '인시 (03:00~05:00)', value: 3 },
  { label: '묘시 (05:00~07:00)', value: 5 },
  { label: '진시 (07:00~09:00)', value: 7 },
  { label: '사시 (09:00~11:00)', value: 9 },
  { label: '오시 (11:00~13:00)', value: 11 },
  { label: '미시 (13:00~15:00)', value: 13 },
  { label: '신시 (15:00~17:00)', value: 15 },
  { label: '유시 (17:00~19:00)', value: 17 },
  { label: '술시 (19:00~21:00)', value: 19 },
  { label: '해시 (21:00~23:00)', value: 21 },
];

export default function InputPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    gender: '',
    year: '',
    month: '',
    day: '',
    calType: 'solar', // solar | lunar
    hour: 12,
    isYajasiNext: false,
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (step === 0 && !form.gender) return '성별을 선택해주세요.';
    if (step === 1) {
      const y = Number(form.year);
      const m = Number(form.month);
      const d = Number(form.day);
      if (!y || y < 1930 || y > 2010) return '출생 연도를 확인해주세요. (1930~2010)';
      if (!m || m < 1 || m > 12) return '월을 확인해주세요.';
      if (!d || d < 1 || d > 31) return '일을 확인해주세요.';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const submit = () => {
    const q = new URLSearchParams({
      gender: form.gender,
      year:   form.year,
      month:  form.month,
      day:    form.day,
      calType: form.calType,
      hour:   form.hour,
      isYajasiNext: form.isYajasiNext ? '1' : '0',
    });
    router.push(`/result?${q.toString()}`);
  };

  return (
    <>
      <Head><title>정보 입력 — 하락이수</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
        {/* 뒤로 */}
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
          ← 홈으로
        </Link>

        {/* 스텝 인디케이터 */}
        <div style={{ maxWidth: 480, margin: '40px auto 0', display: 'flex', gap: 8, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>
            STEP {step + 1} / {STEPS.length}
          </p>

          {/* ── STEP 0: 성별 ── */}
          {step === 0 && (
            <div className="fade-up">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>성별을 선택해주세요</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>
                하락이수는 남녀에 따라 우주 기운의 방향이 달라 완전히 다른 괘가 도출됩니다.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                {['male', 'female'].map(g => (
                  <button key={g} onClick={() => set('gender', g)} style={{
                    flex: 1, padding: '24px 0', borderRadius: 14,
                    border: `2px solid ${form.gender === g ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.gender === g ? 'rgba(124,58,237,0.15)' : 'var(--surface)',
                    color: 'var(--text)', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    {g === 'male' ? '👨 남성' : '👩 여성'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: 생년월일 ── */}
          {step === 1 && (
            <div className="fade-up">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>생년월일을 입력해주세요</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>
                양력/음력 중 알고 계신 방식으로 입력하세요.
              </p>

              {/* 양/음력 선택 */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                {['solar', 'lunar'].map(t => (
                  <button key={t} onClick={() => set('calType', t)} style={{
                    padding: '8px 20px', borderRadius: 8,
                    border: `1px solid ${form.calType === t ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.calType === t ? 'rgba(124,58,237,0.15)' : 'var(--surface)',
                    color: form.calType === t ? 'var(--accent-light)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.9rem',
                  }}>
                    {t === 'solar' ? '양력' : '음력'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: '년', key: 'year', placeholder: '예) 1985', maxLen: 4, width: '45%' },
                  { label: '월', key: 'month', placeholder: '1~12', maxLen: 2, width: '25%' },
                  { label: '일', key: 'day', placeholder: '1~31', maxLen: 2, width: '25%' },
                ].map(f => (
                  <div key={f.key} style={{ width: f.width }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      type="number"
                      placeholder={f.placeholder}
                      maxLength={f.maxLen}
                      value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        border: '1px solid var(--border)', background: 'var(--surface2)',
                        color: 'var(--text)', fontSize: '1rem', outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: 시각 ── */}
          {step === 2 && (
            <div className="fade-up">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>태어난 시각을 선택해주세요</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>
                모르시면 "모름"을 선택하세요. 정확할수록 풀이가 정밀해집니다.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {HOUR_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => set('hour', opt.value)} style={{
                    padding: '12px 16px', borderRadius: 10, textAlign: 'left',
                    border: `1px solid ${form.hour === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.hour === opt.value ? 'rgba(124,58,237,0.15)' : 'var(--surface)',
                    color: form.hour === opt.value ? 'var(--accent-light)' : 'var(--text)',
                    cursor: 'pointer', fontSize: '0.95rem',
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* 야자시 */}
              {form.hour === 0 && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--surface2)', borderRadius: 10 }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    야자시(밤 11시~자정 1시) 처리 방식
                  </p>
                  {[
                    { label: '전날로 처리 (23:00~24:00 출생)', value: false },
                    { label: '다음날로 처리 (00:00~01:00 출생)', value: true },
                  ].map(opt => (
                    <label key={String(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        checked={form.isYajasiNext === opt.value}
                        onChange={() => set('isYajasiNext', opt.value)}
                      />
                      <span style={{ fontSize: '0.9rem' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: 확인 ── */}
          {step === 3 && (
            <div className="fade-up">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>입력 내용을 확인해주세요</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>
                아래 정보로 하락이수를 계산합니다.
              </p>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: '성별', value: form.gender === 'male' ? '남성' : '여성' },
                  { label: '생년월일', value: `${form.year}년 ${form.month}월 ${form.day}일 (${form.calType === 'solar' ? '양력' : '음력'})` },
                  { label: '태어난 시각', value: HOUR_OPTIONS.find(o => o.value === form.hour)?.label ?? '' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: 16 }}>{error}</p>
          )}

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                padding: '14px 24px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
              }}>
                이전
              </button>
            )}
            <button
              onClick={step === STEPS.length - 1 ? submit : next}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 10,
                background: 'var(--accent)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
              }}
            >
              {step === STEPS.length - 1 ? '풀이 시작 →' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
