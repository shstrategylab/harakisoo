/**
 * harakisu.js
 * 브라우저에서 동작하는 하락이수 통합 계산 엔진
 * - 만세력 계산 (사주팔자 도출)
 * - 수리 변환
 * - 선천괘 / 후천괘 / 원당효 / 유년괘 / 타임라인
 */

// ── 60갑자 ────────────────────────────────────────────────────
const GANJI_60 = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
];

// 기준: 2024-01-01 = 甲子(index 0)
const BASE_DATE_MS = new Date('2024-01-01').getTime();

// ── 천간/지지 테이블 ──────────────────────────────────────────
const CHUNGAN_SU = {甲:8,乙:4,丙:9,丁:3,戊:2,己:1,庚:7,辛:6,壬:5,癸:10};
const JIJI_SU    = {子:9,丑:8,寅:7,卯:6,辰:5,巳:4,午:9,未:8,申:7,酉:6,戌:5,亥:4};

const MONTH_TERMS = ['입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설','소한'];
const MONTH_JI    = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
const MONTH_GAN_MAP = {
  甲:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  己:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  乙:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  庚:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  丙:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  辛:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  丁:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  壬:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  戊:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
  癸:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
};
const HOUR_JI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const HOUR_GAN_MAP = {
  甲:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
  己:['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
  乙:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  庚:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
  丙:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  辛:['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
  丁:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  壬:['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
  戊:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  癸:['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
};

// ── 64괘 효 음양 [초효~상효] 1=양, 0=음 ──────────────────────
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

// 문왕 64괘 상하괘 대응표 [상괘-1][하괘-1]  팔괘: 건태리진손감간곤
const GUA_TABLE = [
  [1,43,14,34,9,5,26,11],
  [10,58,38,54,61,60,41,19],
  [13,49,30,55,37,63,22,36],
  [25,17,21,51,42,3,27,24],
  [44,28,50,32,57,48,18,46],
  [6,47,64,40,59,29,4,7],
  [33,31,56,62,53,39,52,15],
  [12,45,35,16,20,8,23,2],
];

// ── DB 캐시 ───────────────────────────────────────────────────
let DB = { manse: null, solar: null, dansa: null, yao: null };

// ── 절기 날짜 수식 계산 (DB 없이 모든 연도 처리) ─────────────
// 수경식(壽星萬年曆) 절기 근사 공식: day = floor(Y*0.2422 + B) - floor(Y/4), Y=year-1900
const SOLAR_TERM_PARAMS = {
  '소한': [1,  6.11], '대한': [1, 20.84],
  '입춘': [2,  4.60], '우수': [2, 19.40],
  '경칩': [3,  6.18], '춘분': [3, 20.90],
  '청명': [4,  5.15], '곡우': [4, 20.65],
  '입하': [5,  6.13], '소만': [5, 21.37],
  '망종': [6,  6.43], '하지': [6, 21.92],
  '소서': [7,  7.62], '대서': [7, 23.15],
  '입추': [8,  8.35], '처서': [8, 23.95],
  '백로': [9,  8.44], '추분': [9, 23.42],
  '한로': [10, 8.90], '상강': [10,23.90],
  '입동': [11, 8.11], '소설': [11,22.94],
  '대설': [12, 7.69], '동지': [12,22.38],
};

function getSolarTermDate(termName, year) {
  const dbEntry = (DB.solar || []).find(t => t.name === termName && t.date?.startsWith(String(year)));
  if (dbEntry) return dbEntry.date;
  const p = SOLAR_TERM_PARAMS[termName];
  if (!p) return null;
  const Y = year - 1900;
  const [mon, B] = p;
  const day = Math.floor(Y * 0.2422 + B) - Math.floor(Y / 4);
  return `${year}-${String(mon).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

async function loadDB() {
  if (DB.manse) return;
  const base = getBasePath();

  // 1차: 필수 파일 먼저 (가볍고 빠름)
  const [solar, dansa, yao, manseMeta] = await Promise.all([
    fetch(`${base}data/solar_terms_db.json`).then(r => r.json()),
    fetch(`${base}data/iching_dansa.json`).then(r => r.json()),
    fetch(`${base}data/iching_384_korean.json`).then(r => r.json()),
    fetch(`${base}data/manse_meta.json`).then(r => r.json()),
  ]);
  DB.solar = solar; DB.dansa = dansa; DB.yao = yao;
  DB.manse = { ...manseMeta, daily_cache: {} };

  // 2차: daily_cache 백그라운드 로딩 (1950~2050 일진, 약 800KB)
  // 로딩 완료 전에는 60갑자 역산으로 자동 fallback
  fetch(`${base}data/daily_cache.json`)
    .then(r => r.json())
    .then(cache => { DB.manse.daily_cache = cache; })
    .catch(() => {});
}

function getBasePath() {
  // GitHub Pages: /harakisoo/ 경로 대응
  const p = location.pathname;
  const match = p.match(/^(\/[^/]+\/)/);
  return match ? match[1] : '/';
}

// ── 일주 계산 ─────────────────────────────────────────────────
function getDayGanji(dateStr) {
  if (DB.manse?.daily_cache?.[dateStr]) {
    const g = DB.manse.daily_cache[dateStr];
    return { gan: g[0], ji: g[1] };
  }
  const diff = Math.round((new Date(dateStr).getTime() - BASE_DATE_MS) / 86400000);
  const idx  = ((diff % 60) + 60) % 60;
  const g    = GANJI_60[idx];
  return { gan: g[0], ji: g[1] };
}

// ── 연주 계산 ─────────────────────────────────────────────────
function getYearGanji(year, dateStr) {
  const ipchun = DB.solar?.find(t => t.name === '입춘' && t.date?.startsWith(String(year)));
  let y = year;
  if (ipchun && new Date(dateStr) < new Date(ipchun.date)) y = year - 1;
  const idx = (((y - 1984) % 60) + 60) % 60;
  const g   = GANJI_60[idx];
  return { gan: g[0], ji: g[1] };
}

// ── 월주 계산 ─────────────────────────────────────────────────
function getMonthGanji(year, dateStr, yearGan) {
  const targetDate = new Date(dateStr);
  const candidates = [];
  for (const termName of MONTH_TERMS) {
    for (const y of [year - 1, year, year + 1]) {
      const d = getSolarTermDate(termName, y);
      if (d) candidates.push({ name: termName, date: d });
    }
  }
  candidates.sort((a, b) => new Date(a.date) - new Date(b.date));
  let monthNo = 0;
  for (let i = candidates.length - 1; i >= 0; i--) {
    if (new Date(candidates[i].date) <= targetDate) {
      monthNo = MONTH_TERMS.indexOf(candidates[i].name); break;
    }
  }
  const ganArr = MONTH_GAN_MAP[yearGan] || MONTH_GAN_MAP['甲'];
  return { gan: ganArr[monthNo], ji: MONTH_JI[monthNo] };
}

// ── 시주 계산 ─────────────────────────────────────────────────
function getHourGanji(hour, dayGan) {
  const ji    = hour === 23 ? '子' : HOUR_JI[Math.min(Math.floor((hour + 1) / 2), 11)];
  const idx   = HOUR_JI.indexOf(ji);
  const ganArr = HOUR_GAN_MAP[dayGan] || HOUR_GAN_MAP['甲'];
  return { gan: ganArr[idx], ji };
}

// ── 괘 도출 ───────────────────────────────────────────────────
function getGuaNum(su) { const r = su % 8; return r === 0 ? 8 : r; }

function calcGua(cs, js) {
  const sg = getGuaNum(cs), hg = getGuaNum(js);
  return { guaNo: GUA_TABLE[sg - 1][hg - 1], sangGua: sg, haGua: hg };
}

function calcWondang(cs, js) {
  const r = (cs + js) % 6; return r === 0 ? 6 : r;
}

function calcHucheon(guaNo, wondang) {
  const lines = [...GUA_LINES[guaNo]];
  lines[wondang - 1] = lines[wondang - 1] === 1 ? 0 : 1;
  for (const [n, gl] of Object.entries(GUA_LINES)) {
    if (gl.every((v, i) => v === lines[i])) return Number(n);
  }
  return guaNo;
}

function buildTimeline(scGua, hcGua, wondang, birthYear) {
  const tl = [];
  let age = 1, idx = wondang - 1, isHc = false, passed = 0;
  for (let step = 0; step < 14; step++) {
    const gua   = isHc ? hcGua : scGua;
    const lines = GUA_LINES[gua];
    const yang  = lines[idx] === 1;
    const years = yang ? 9 : 6;
    tl.push({
      gua, yaoPos: idx + 1, yang, years,
      startAge: age, endAge: age + years - 1,
      startYear: birthYear + age - 1,
      endYear:   birthYear + age + years - 2,
      isHc,
    });
    age += years;
    if (!isHc) {
      passed++;
      if (passed >= 6 - (wondang - 1)) { isHc = true; idx = 0; }
      else idx = (idx + 1) % 6;
    } else {
      idx = (idx + 1) % 6;
    }
    if (age > 110) break;
  }
  return tl;
}

function calcYunnyeon(scGua, hcGua, wondang, birthYear, currentYear) {
  const age = currentYear - birthYear + 1;
  const tl  = buildTimeline(scGua, hcGua, wondang, birthYear);
  return tl.find(t => age >= t.startAge && age <= t.endAge) || tl[0];
}

// ── 메인 계산 함수 ────────────────────────────────────────────
async function calcHarakisu({ year, month, day, hour = 12, gender = 'male' }) {
  await loadDB();

  const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

  const yearG  = getYearGanji(year, dateStr);
  const monthG = getMonthGanji(year, dateStr, yearG.gan);
  const dayG   = getDayGanji(dateStr);
  const hourG  = getHourGanji(hour, dayG.gan);

  const ganji8 = [yearG.gan,yearG.ji, monthG.gan,monthG.ji, dayG.gan,dayG.ji, hourG.gan,hourG.ji];

  // 수리
  const cgs  = [yearG.gan, monthG.gan, dayG.gan, hourG.gan];
  const jgs  = [yearG.ji,  monthG.ji,  dayG.ji,  hourG.ji];
  const allSu = [...cgs.map(g => CHUNGAN_SU[g]||0), ...jgs.map(j => JIJI_SU[j]||0)];
  const cheonsu = allSu.filter(n => n % 2 !== 0).reduce((a,b)=>a+b,0);
  const jisu    = allSu.filter(n => n % 2 === 0).reduce((a,b)=>a+b,0);

  const csF = gender === 'male' ? cheonsu : jisu;
  const jsF = gender === 'male' ? jisu    : cheonsu;

  const sc      = calcGua(csF, jsF);
  const wondang = calcWondang(cheonsu, jisu);
  const hcNo    = calcHucheon(sc.guaNo, wondang);
  const tl      = buildTimeline(sc.guaNo, hcNo, wondang, year);
  const currentYear = new Date().getFullYear();
  const yy      = calcYunnyeon(sc.guaNo, hcNo, wondang, year, currentYear);

  // DB 조회
  const scInfo  = DB.dansa[sc.guaNo]  || {};
  const hcInfo  = DB.dansa[hcNo]      || {};
  const yyInfo  = DB.dansa[yy.gua]    || {};
  const scYao   = DB.yao[sc.guaNo]?.lines?.[wondang]  || {};
  const yyYao   = DB.yao[yy.gua]?.lines?.[yy.yaoPos]  || {};
  const scHex   = DB.yao[sc.guaNo]    || {};
  const hcHex   = DB.yao[hcNo]        || {};
  const yyHex   = DB.yao[yy.gua]      || {};

  return {
    ganji8, yearG, monthG, dayG, hourG,
    suri: { allSu, cheonsu, jisu, csF, jsF,
      chunganList: cgs.map((g,i)=>({char:g, su:CHUNGAN_SU[g]||0})),
      jijiList:    jgs.map((j,i)=>({char:j, su:JIJI_SU[j]||0})),
    },
    sc: { ...sc, ...scInfo, lines: GUA_LINES[sc.guaNo] },
    hc: { guaNo: hcNo, ...hcInfo, lines: GUA_LINES[hcNo] },
    wondang, wondangYao: scYao,
    yy: { ...yy, ...yyInfo, yaoData: yyYao, name: yyInfo.name || yyHex.korean_name },
    timeline: tl,
    gender, birthYear: year, currentYear,
    GUA_LINES,
  };
}

// ── 효 시각화 HTML 생성 ───────────────────────────────────────
function renderYao(lines = [], highlightPos = null, size = 'sm') {
  const lg = size === 'lg';
  const w1 = lg ? 52 : 36, w2 = lg ? 22 : 15, gap = lg ? 8 : 5, h = lg ? 18 : 12;
  let html = '<div class="yao-wrap">';
  for (let i = 0; i < lines.length; i++) {
    const pos = i + 1;
    const hl  = highlightPos === pos;
    const cls = hl ? 'yao-gold' : '';
    const hpx = h + 'px';
    if (lines[i] === 1) {
      html += `<div class="yao-line"><div class="yao-yang ${cls}" style="width:${w1}px;height:${hpx}"></div></div>`;
    } else {
      html += `<div class="yao-line">
        <div class="yao-yin ${cls}" style="width:${w2}px;height:${hpx}"></div>
        <div style="width:${gap}px"></div>
        <div class="yao-yin ${cls}" style="width:${w2}px;height:${hpx}"></div>
      </div>`;
    }
  }
  html += '</div>';
  return html;
}

// ── 전역 노출 ─────────────────────────────────────────────────
window.Harakisu = { calcHarakisu, renderYao, loadDB, GUA_LINES, DB };
