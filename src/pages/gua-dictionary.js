import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import path from 'path';
import fs from 'fs';

// ── 효 시각화 ────────────────────────────────────────────────
const GUA_LINES = {
  1:[1,1,1,1,1,1],2:[0,0,0,0,0,0],3:[1,0,0,0,1,0],4:[0,1,0,0,0,1],
  5:[1,1,1,0,1,0],6:[0,1,0,1,1,1],7:[0,1,0,0,0,0],8:[0,0,0,0,1,0],
  9:[1,1,1,0,1,1],10:[1,1,0,1,1,1],11:[1,1,1,0,0,0],12:[0,0,0,1,1,1],
  13:[1,0,1,1,1,1],14:[1,1,1,1,0,1],15:[0,0,1,0,0,0],16:[0,0,0,1,0,0],
  17:[1,0,0,1,1,0],18:[0,1,1,0,0,1],19:[1,1,0,0,0,0],20:[0,0,0,0,1,1],
  21:[1,0,0,1,0,1],22:[1,0,1,0,0,1],23:[0,0,0,0,0,1],24:[1,0,0,0,0,0],
  25:[1,0,0,1,1,1],26:[1,1,1,0,0,1],27:[1,0,0,0,0,1],28:[0,1,1,1,1,0],
  29:[0,1,0,0,1,0],30:[1,0,1,1,0,1],31:[0,0,1,1,1,0],32:[0,1,1,1,0,0],
  33:[0,0,1,1,1,1],34:[1,1,1,1,0,0],35:[0,0,0,1,0,1],36:[1,0,1,0,0,0],
  37:[1,0,1,0,1,1],38:[1,1,0,1,0,1],39:[0,0,1,0,1,0],40:[0,1,0,1,0,0],
  41:[1,1,0,0,0,1],42:[1,0,0,0,1,1],43:[1,1,1,1,1,0],44:[0,1,1,1,1,1],
  45:[0,0,0,1,1,0],46:[0,1,1,0,0,0],47:[0,1,0,1,1,0],48:[0,1,1,0,1,0],
  49:[1,0,1,1,1,0],50:[0,1,1,1,0,1],51:[1,0,0,1,0,0],52:[0,0,1,0,0,1],
  53:[0,0,1,0,1,1],54:[1,1,0,1,0,0],55:[1,0,1,1,0,0],56:[0,0,1,1,0,1],
  57:[0,1,1,0,1,1],58:[1,1,0,1,1,0],59:[0,1,0,0,1,1],60:[1,1,0,0,1,0],
  61:[1,1,0,0,1,1],62:[0,0,1,1,0,0],63:[1,0,1,0,1,0],64:[0,1,0,1,0,1],
};

function MiniGua({ lines = [] }) {
  return (
    <div style={{ display:'flex', flexDirection:'column-reverse', gap:2 }}>
      {lines.map((v,i) => (
        <div key={i} style={{ display:'flex', gap:2 }}>
          {v === 1
            ? <div style={{ width:24, height:8, background:'var(--accent-light)', borderRadius:2 }} />
            : <>
                <div style={{ width:10, height:8, background:'var(--accent-light)', borderRadius:2 }} />
                <div style={{ width:4 }} />
                <div style={{ width:10, height:8, background:'var(--accent-light)', borderRadius:2 }} />
              </>}
        </div>
      ))}
    </div>
  );
}

function LargeGua({ lines = [], highlightPos = null }) {
  return (
    <div style={{ display:'flex', flexDirection:'column-reverse', gap:5 }}>
      {lines.map((v,i) => {
        const pos = i + 1;
        const hl = highlightPos === pos;
        const color = hl ? 'var(--gold)' : 'var(--accent-light)';
        return (
          <div key={i} style={{ display:'flex', gap:4, alignItems:'center' }}>
            <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', width:14, textAlign:'right' }}>{pos}</span>
            {v === 1
              ? <div style={{ width:52, height:18, background:color, borderRadius:3 }} />
              : <>
                  <div style={{ width:22, height:18, background:color, borderRadius:3 }} />
                  <div style={{ width:8 }} />
                  <div style={{ width:22, height:18, background:color, borderRadius:3 }} />
                </>}
            {hl && <span style={{ fontSize:'0.65rem', color:'var(--gold)', marginLeft:4 }}>←</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export default function GuaDictionary({ guaList, yaoMap }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');

  const entries = guaList.filter(g =>
    !search || g.name?.includes(search) || String(g.no) === search
  );

  const sel    = selected ? guaList.find(g => g.no === selected) : null;
  const selYao = selected ? yaoMap[selected] : null;

  return (
    <>
      <Head><title>64괘 사전 — 하락이수</title></Head>
      <div style={{ minHeight:'100vh', background:'var(--bg)' }}>

        <header style={{ borderBottom:'1px solid var(--border)', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Link href="/" style={{ color:'var(--gold)', fontWeight:700, textDecoration:'none' }}>河洛理數</Link>
          <nav style={{ display:'flex', gap:20, fontSize:'0.85rem' }}>
            <Link href="/input"  style={{ color:'var(--accent-light)', textDecoration:'none' }}>풀이 시작 →</Link>
            <Link href="/guide"  style={{ color:'var(--text-muted)',   textDecoration:'none' }}>로드맵</Link>
          </nav>
        </header>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 20px', display:'flex', gap:24, alignItems:'flex-start' }}>

          {/* ── 왼쪽 목록 ── */}
          <div style={{ width:260, flexShrink:0 }}>
            <h1 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:14 }}>64괘 사전</h1>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="괘 이름 또는 번호 검색..."
              style={{
                width:'100%', padding:'10px 14px', borderRadius:10,
                border:'1px solid var(--border)', background:'var(--surface2)',
                color:'var(--text)', fontSize:'0.88rem', outline:'none', marginBottom:10,
              }}
            />
            <div style={{ display:'flex', flexDirection:'column', gap:3, maxHeight:'calc(100vh - 230px)', overflowY:'auto' }}>
              {entries.map(g => (
                <button key={g.no} onClick={() => setSelected(g.no)} style={{
                  display:'flex', gap:12, alignItems:'center',
                  padding:'9px 11px', borderRadius:8, textAlign:'left',
                  border:`1px solid ${selected===g.no?'var(--accent)':'var(--border)'}`,
                  background: selected===g.no ? 'rgba(124,58,237,0.15)' : 'transparent',
                  cursor:'pointer', transition:'all 0.15s',
                }}>
                  <MiniGua lines={GUA_LINES[g.no] || []} />
                  <div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginBottom:1 }}>{g.no}번</div>
                    <div style={{ fontWeight:600, fontSize:'0.88rem', color: selected===g.no ? 'var(--accent-light)' : 'var(--text)' }}>
                      {g.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── 오른쪽 상세 ── */}
          <div style={{ flex:1, minWidth:0 }}>
            {!sel ? (
              <div style={{ textAlign:'center', padding:'80px 0', color:'var(--text-muted)' }}>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>☯</div>
                <p>왼쪽에서 괘를 선택하면 상세 정보가 표시됩니다.</p>
                <p style={{ fontSize:'0.85rem', marginTop:8 }}>총 64괘 · 384효 수록</p>
              </div>
            ) : (
              <div key={sel.no} className="fade-up">

                {/* 괘 헤더 */}
                <div className="card" style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', gap:28, alignItems:'center', marginBottom:20 }}>
                    <LargeGua lines={GUA_LINES[sel.no] || []} />
                    <div>
                      <p style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:4 }}>{sel.no}번괘</p>
                      <h2 style={{ fontSize:'2rem', fontWeight:800, lineHeight:1.1, marginBottom:6 }}>{sel.name}</h2>
                      {selYao && (
                        <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                          {selYao.trad_chinese} · {selYao.pinyin} · {selYao.english}
                        </p>
                      )}
                    </div>
                  </div>

                  {[
                    { label:'괘사(卦辭)', text: sel.dansa },
                    { label:'상전(象傳)', text: sel.sangjeon },
                    { label:'실용 해석', text: sel.practical },
                    { label:'주의사항',  text: sel.caution },
                  ].map(row => row.text && (
                    <div key={row.label} style={{ borderTop:'1px solid var(--border)', paddingTop:14, marginTop:14 }}>
                      <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:6, letterSpacing:'0.05em' }}>{row.label}</p>
                      <p style={{ lineHeight:1.85, fontSize:'0.95rem' }}>{row.text}</p>
                    </div>
                  ))}
                </div>

                {/* 6효 상세 */}
                {selYao?.lines && (
                  <div className="card">
                    <h3 style={{ fontWeight:700, marginBottom:18 }}>6효(爻) 상세</h3>
                    {[6,5,4,3,2,1].map(pos => {
                      const yao = selYao.lines[String(pos)] || selYao.lines[pos];
                      if (!yao) return null;
                      const lineVal = (GUA_LINES[sel.no] || [])[pos - 1];
                      return (
                        <div key={pos} style={{
                          borderTop: pos < 6 ? '1px solid var(--border)' : 'none',
                          paddingTop: pos < 6 ? 14 : 0,
                          marginTop:  pos < 6 ? 14 : 0,
                          display:'flex', gap:16,
                        }}>
                          <div style={{ flexShrink:0, paddingTop:2 }}>
                            {lineVal === 1
                              ? <div style={{ width:36, height:12, background:'var(--accent-light)', borderRadius:2 }} />
                              : <div style={{ display:'flex', gap:3 }}>
                                  <div style={{ width:15, height:12, background:'var(--accent-light)', borderRadius:2 }} />
                                  <div style={{ width:6 }} />
                                  <div style={{ width:15, height:12, background:'var(--accent-light)', borderRadius:2 }} />
                                </div>}
                            <div style={{ fontSize:'0.6rem', color:'var(--gold)', marginTop:3, textAlign:'center' }}>{pos}효</div>
                          </div>
                          <div>
                            <p style={{ fontWeight:600, marginBottom:5, fontSize:'0.93rem' }}>{yao.text_ko}</p>
                            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', lineHeight:1.75 }}>{yao.comment_ko}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── 서버사이드: DB를 빌드 시점에 읽어 props로 전달 ───────────
export async function getStaticProps() {
  const dataDir = path.join(process.cwd(), 'data');
  const guaDB   = JSON.parse(fs.readFileSync(path.join(dataDir, 'iching_dansa.json'),    'utf8'));
  const yaoDB   = JSON.parse(fs.readFileSync(path.join(dataDir, 'iching_384_korean.json'),'utf8'));

  // 배열 형태로 변환 (클라이언트 전달용)
  const guaList = Object.entries(guaDB).map(([no, g]) => ({ no: Number(no), ...g }));

  // yaoDB: key를 숫자로 통일
  const yaoMap = {};
  Object.entries(yaoDB).forEach(([k, v]) => { yaoMap[Number(k)] = v; });

  return { props: { guaList, yaoMap } };
}
