/**
 * POST /api/calculate
 * body: { year, month, day, hour, gender, calType, isYajasiNext }
 * 서버에서 DB 파일을 직접 읽어 계산 후 결과 반환
 */

import path from 'path';
import fs from 'fs';

// ── 데이터 로드 (서버 시작 시 1회) ────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data');

function loadJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
}

let manseDB, solarTerms, guaDB, yaoDB;
try {
  manseDB     = loadJSON('manse_100_db.json');
  solarTerms  = loadJSON('solar_terms_db.json');
  guaDB       = loadJSON('iching_dansa.json');
  yaoDB       = loadJSON('iching_384_korean.json');
} catch (e) {
  console.error('DB 로드 실패:', e.message);
}

// ── 60갑자 ────────────────────────────────────────────────────
const GANJI_60 = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
];
const BASE_DATE = new Date('2024-01-01');
const BASE_IDX  = 0;

function getDayGanji(dateStr) {
  if (manseDB?.daily_cache?.[dateStr]) {
    const g = manseDB.daily_cache[dateStr];
    return { gan: g[0], ji: g[1] };
  }
  const diff = Math.round((new Date(dateStr) - BASE_DATE) / 86400000);
  const idx  = ((BASE_IDX + diff) % 60 + 60) % 60;
  const g    = GANJI_60[idx];
  return { gan: g[0], ji: g[1] };
}

const MONTH_TERMS = ['소한','입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설'];
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

const HOUR_JI  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
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

// 천간수·지지수
const CHUNGAN_SU = { 甲:8,乙:4,丙:9,丁:3,戊:2,己:1,庚:7,辛:6,壬:5,癸:10 };
const JIJI_SU    = { 子:9,丑:8,寅:7,卯:6,辰:5,巳:4,午:9,未:8,申:7,酉:6,戌:5,亥:4 };

// 64괘 효 음양 배열 [초효~상효] 1=양, 0=음
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

// 문왕 64괘 상하괘 대응표 [상괘-1][하괘-1]
// 팔괘순: 건=1,태=2,리=3,진=4,손=5,감=6,간=7,곤=8
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

function getGuaNum(su) { const r = su % 8; return r === 0 ? 8 : r; }

function calcGua(cheonsu, jisu) {
  const sg = getGuaNum(cheonsu);
  const hg = getGuaNum(jisu);
  return { guaNo: GUA_TABLE[sg-1][hg-1], sangGua: sg, haGua: hg };
}

function calcWondang(cheonsu, jisu) {
  const r = (cheonsu + jisu) % 6;
  return r === 0 ? 6 : r;
}

function calcHucheon(guaNo, wondang) {
  const lines = [...GUA_LINES[guaNo]];
  lines[wondang - 1] = lines[wondang - 1] === 1 ? 0 : 1;
  for (const [num, gl] of Object.entries(GUA_LINES)) {
    if (gl.every((v, i) => v === lines[i])) return Number(num);
  }
  return guaNo;
}

function buildTimeline(scGua, hcGua, wondang, birthYear) {
  const timeline = [];
  let age = 1, idx = wondang - 1, isHc = false, passed = 0;
  for (let step = 0; step < 14; step++) {
    const gua = isHc ? hcGua : scGua;
    const lines = GUA_LINES[gua];
    const yaoType = lines[idx] === 1 ? 'yang' : 'yin';
    const years = yaoType === 'yang' ? 9 : 6;
    timeline.push({
      gua, yaoPos: idx + 1, yaoType, years,
      startAge: age, endAge: age + years - 1,
      startYear: birthYear + age - 1,
      endYear: birthYear + age + years - 2,
      isHucheon: isHc,
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
  return timeline;
}

function calcYunnyeon(guaNo, hcGuaNo, wondang, birthYear, currentYear) {
  const korAge = currentYear - birthYear + 1;
  const timeline = buildTimeline(guaNo, hcGuaNo, wondang, birthYear);
  const cur = timeline.find(t => korAge >= t.startAge && korAge <= t.endAge);
  return cur
    ? { guaNo: cur.gua, yaoPos: cur.yaoPos, age: korAge }
    : { guaNo, yaoPos: wondang, age: korAge };
}

// ── 메인 핸들러 ───────────────────────────────────────────────
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { year, month, day, hour = 12, gender = 'male', isYajasiNext = false } = req.body;

    const y = Number(year), m = Number(month), d = Number(day), h = Number(hour);
    const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    // 연주
    const ipchun = solarTerms?.find(t => t.name === '입춘' && t.date?.startsWith(String(y)));
    let yy = y;
    if (ipchun && new Date(dateStr) < new Date(ipchun.date)) yy = y - 1;
    const yearIdx = (((yy - 1984) % 60) + 60) % 60;
    const yearGanji = { gan: GANJI_60[yearIdx][0], ji: GANJI_60[yearIdx][1] };

    // 월주
    const terms = (solarTerms || [])
      .filter(t => MONTH_TERMS.includes(t.name))
      .filter(t => { const ty = parseInt(t.date); return ty >= y-1 && ty <= y+1; })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    let monthNo = 0;
    for (let i = terms.length - 1; i >= 0; i--) {
      if (new Date(terms[i].date) <= new Date(dateStr)) {
        monthNo = MONTH_TERMS.indexOf(terms[i].name); break;
      }
    }
    const ganArr = MONTH_GAN_MAP[yearGanji.gan] || MONTH_GAN_MAP['甲'];
    const monthGanji = { gan: ganArr[monthNo], ji: MONTH_JI[monthNo] };

    // 일주
    const dayGanji = getDayGanji(dateStr);

    // 시주
    const hji = h === 23 ? '子' : HOUR_JI[Math.min(Math.floor((h + 1) / 2), 11)];
    const hIdx = HOUR_JI.indexOf(hji);
    const hGanArr = HOUR_GAN_MAP[dayGanji.gan] || HOUR_GAN_MAP['甲'];
    const hourGanji = { gan: hGanArr[hIdx], ji: hji };

    const ganji8 = [yearGanji.gan,yearGanji.ji,monthGanji.gan,monthGanji.ji,
                    dayGanji.gan,dayGanji.ji,hourGanji.gan,hourGanji.ji];

    // 수리
    const allSu = [
      ...ganji8.filter((_,i)=>i%2===0).map(g=>CHUNGAN_SU[g]||0),
      ...ganji8.filter((_,i)=>i%2===1).map(j=>JIJI_SU[j]||0),
    ];
    const cheonsu = allSu.filter(n=>n%2!==0).reduce((a,b)=>a+b,0);
    const jisu    = allSu.filter(n=>n%2===0).reduce((a,b)=>a+b,0);

    const csF = gender==='male'?cheonsu:jisu;
    const jsF = gender==='male'?jisu:cheonsu;

    // 괘
    const sc = calcGua(csF, jsF);
    const wondang = calcWondang(cheonsu, jisu);
    const hcGuaNo = calcHucheon(sc.guaNo, wondang);
    const timeline = buildTimeline(sc.guaNo, hcGuaNo, wondang, y);
    const currentYear = new Date().getFullYear();
    const yunnyeon = calcYunnyeon(sc.guaNo, hcGuaNo, wondang, y, currentYear);

    // DB 조회
    const scInfo  = guaDB?.[sc.guaNo]   || {};
    const hcInfo  = guaDB?.[hcGuaNo]    || {};
    const yyInfo  = guaDB?.[yunnyeon.guaNo] || {};
    const scYao   = yaoDB?.[sc.guaNo]?.lines?.[wondang] || {};
    const yyYao   = yaoDB?.[yunnyeon.guaNo]?.lines?.[yunnyeon.yaoPos] || {};
    const scHex   = yaoDB?.[sc.guaNo]   || {};
    const hcHex   = yaoDB?.[hcGuaNo]    || {};
    const yyHex   = yaoDB?.[yunnyeon.guaNo] || {};

    res.status(200).json({
      saju: { yearGanji, monthGanji, dayGanji, hourGanji, ganji8 },
      suri: { cheonsu, jisu, csF, jsF, allSu,
        chunganList: ganji8.filter((_,i)=>i%2===0).map((g,i)=>({char:g,su:CHUNGAN_SU[g]||0})),
        jijiList:    ganji8.filter((_,i)=>i%2===1).map((j,i)=>({char:j,su:JIJI_SU[j]||0})),
      },
      seoncheon: {
        guaNo: sc.guaNo,
        name: scInfo.name || scHex.korean_name || '',
        hex: scHex.hex || '',
        dansa: scInfo.dansa || '',
        sangjeon: scInfo.sangjeon || '',
        practical: scInfo.practical || '',
        caution: scInfo.caution || '',
        sangGua: sc.sangGua, haGua: sc.haGua,
      },
      hucheon: {
        guaNo: hcGuaNo,
        name: hcInfo.name || hcHex.korean_name || '',
        hex: hcHex.hex || '',
        dansa: hcInfo.dansa || '',
        sangjeon: hcInfo.sangjeon || '',
        practical: hcInfo.practical || '',
        caution: hcInfo.caution || '',
      },
      wondang,
      wondangYao: scYao,
      yunnyeon: {
        ...yunnyeon,
        name: yyInfo.name || yyHex.korean_name || '',
        hex: yyHex.hex || '',
        dansa: yyInfo.dansa || '',
        yaoData: yyYao,
      },
      timeline,
      gender, birthYear: y, currentYear,
      lines: { sc: GUA_LINES[sc.guaNo], hc: GUA_LINES[hcGuaNo] },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
