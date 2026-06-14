/**
 * harakisu_core.js
 * 하락이수 핵심 계산 엔진
 * - 천간수·지지수 변환
 * - 천수·지수 산출
 * - 선천괘·후천괘·원당효·유년괘 도출
 */

// ─── 1. 천간 수리표 ───────────────────────────────────────────
// 하락이수 고유 수리: 갑=8, 을=4, 병=9, 정=3, 무=2, 기=1, 경=7, 신=6, 임=5, 계=10
export const CHUNGAN_SU = {
  甲: 8, 乙: 4, 丙: 9, 丁: 3, 戊: 2,
  己: 1, 庚: 7, 辛: 6, 壬: 5, 癸: 10,
};

// ─── 2. 지지 수리표 ───────────────────────────────────────────
// 자=9, 축=8, 인=7, 묘=6, 진=5, 사=4, 오=9, 미=8, 신=7, 유=6, 술=5, 해=4
export const JIJI_SU = {
  子: 9, 丑: 8, 寅: 7, 卯: 6, 辰: 5, 巳: 4,
  午: 9, 未: 8, 申: 7, 酉: 6, 戌: 5, 亥: 4,
};

// ─── 3. 괘 효 구조 (1=초효~6=상효, 양효=9년, 음효=6년) ───────
// 64괘 각 효의 음양: 1=양(—), 0=음(--)
// 건(1)=111111, 곤(2)=000000 … 순서는 문왕 64괘 순
export const GUA_LINES = {
  1:  [1,1,1,1,1,1], 2:  [0,0,0,0,0,0], 3:  [1,0,0,0,1,0], 4:  [0,1,0,0,0,1],
  5:  [1,1,1,0,1,0], 6:  [0,1,0,1,1,1], 7:  [0,1,0,0,0,0], 8:  [0,0,0,0,1,0],
  9:  [1,1,1,0,1,1], 10: [1,1,0,1,1,1], 11: [1,1,1,0,0,0], 12: [0,0,0,1,1,1],
  13: [1,0,1,1,1,1], 14: [1,1,1,1,0,1], 15: [0,0,1,0,0,0], 16: [0,0,0,1,0,0],
  17: [1,0,0,1,1,0], 18: [0,1,1,0,0,1], 19: [1,1,0,0,0,0], 20: [0,0,0,0,1,1],
  21: [1,0,0,1,0,1], 22: [1,0,1,0,0,1], 23: [0,0,0,0,0,1], 24: [1,0,0,0,0,0],
  25: [1,0,0,1,1,1], 26: [1,1,1,0,0,1], 27: [1,0,0,0,0,1], 28: [0,1,1,1,1,0],
  29: [0,1,0,0,1,0], 30: [1,0,1,1,0,1], 31: [0,0,1,1,1,0], 32: [0,1,1,1,0,0],
  33: [0,0,1,1,1,1], 34: [1,1,1,1,0,0], 35: [0,0,0,1,0,1], 36: [1,0,1,0,0,0],
  37: [1,0,1,0,1,1], 38: [1,1,0,1,0,1], 39: [0,0,1,0,1,0], 40: [0,1,0,1,0,0],
  41: [1,1,0,0,0,1], 42: [1,0,0,0,1,1], 43: [1,1,1,1,1,0], 44: [0,1,1,1,1,1],
  45: [0,0,0,1,1,0], 46: [0,1,1,0,0,0], 47: [0,1,0,1,1,0], 48: [0,1,1,0,1,0],
  49: [1,0,1,1,1,0], 50: [0,1,1,1,0,1], 51: [1,0,0,1,0,0], 52: [0,0,1,0,0,1],
  53: [0,0,1,0,1,1], 54: [1,1,0,1,0,0], 55: [1,0,1,1,0,0], 56: [0,0,1,1,0,1],
  57: [0,1,1,0,1,1], 58: [1,1,0,1,1,0], 59: [0,1,0,0,1,1], 60: [1,1,0,0,1,0],
  61: [1,1,0,0,1,1], 62: [0,0,1,1,0,0], 63: [1,0,1,0,1,0], 64: [0,1,0,1,0,1],
};

// ─── 4. 사주 8글자를 수리로 변환 ─────────────────────────────
/**
 * @param {string[]} ganji8 - ['甲','子','丙','午','壬','寅','庚','申'] (연간,연지,월간,월지,일간,일지,시간,시지)
 * @returns {{ chunganList, jijiList, cheonsu, jisu, total }}
 */
export function calcSuri(ganji8) {
  const [yg, yj, mg, mj, dg, dj, hg, hj] = ganji8;

  const chunganList = [yg, mg, dg, hg].map(g => ({ char: g, su: CHUNGAN_SU[g] ?? 0 }));
  const jijiList    = [yj, mj, dj, hj].map(j => ({ char: j, su: JIJI_SU[j]    ?? 0 }));

  const allSu = [...chunganList, ...jijiList].map(x => x.su);

  // 천수(홀수합), 지수(짝수합)
  const cheonsu = allSu.filter(n => n % 2 !== 0).reduce((a, b) => a + b, 0);
  const jisu    = allSu.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);

  return { chunganList, jijiList, cheonsu, jisu, total: cheonsu + jisu };
}

// ─── 5. 천수·지수로 괘 번호 도출 ─────────────────────────────
/**
 * 하락이수 괘 도출 공식
 * 상괘(외괘): 천수 ÷ 8 나머지 → 팔괘 번호
 * 하괘(내괘): 지수 ÷ 8 나머지 → 팔괘 번호
 * 나머지 0 → 8로 처리
 * 상하괘 조합 → 64괘 번호 (문왕 배열표)
 */

// 팔괘 번호 → 문왕 64괘 조합표 [상괘][하괘] = 괘번호
const GUA_TABLE = {
  1: { 1:1,  2:11, 3:26, 4:5,  5:9,  6:14, 7:34, 8:43 },
  2: { 1:12, 2:2,  3:23, 4:8,  5:20, 6:35, 7:16, 8:45 },
  3: { 1:25, 2:24, 3:51, 4:3,  5:42, 6:21, 7:17, 8:49 },
  4: { 1:6,  2:7,  3:4,  4:29, 5:59, 6:64, 7:40, 8:47 },
  5: { 1:33, 2:15, 3:52, 4:39, 5:53, 6:56, 7:62, 8:31 },
  6: { 1:44, 2:46, 3:50, 4:48, 5:57, 6:30, 7:32, 8:28 },
  7: { 1:13, 2:36, 3:22, 4:63, 5:37, 6:55, 7:30, 8:49 },
  8: { 1:10, 2:19, 3:41, 4:60, 5:61, 6:38, 7:54, 8:58 },
};

// 실제 표준 문왕 64괘 상하괘 대응표
const GUA_TABLE_FULL = [
  //하괘→  건  태  리  진  손  감  간  곤
  /* 건 */  [1, 43,14,34, 9, 5,26,11],
  /* 태 */ [10,58,38,54,61,60,41,19],
  /* 리 */ [13,49,30,55,37,63,22,36],
  /* 진 */ [25,17,21,51,42, 3,27,24],
  /* 손 */ [44,28,50,32,57,48,18,46],
  /* 감 */ [ 6,47,64,40,59,29, 4, 7],
  /* 간 */ [33,31,56,62,53,39,52,15],
  /* 곤 */ [12,45,35,16,20, 8,23, 2],
];

// 팔괘 순서: 건=1,태=2,리=3,진=4,손=5,감=6,간=7,곤=8
function getGuaNum(su) {
  const r = su % 8;
  return r === 0 ? 8 : r;
}

export function calcGua(cheonsu, jisu) {
  const sangGua = getGuaNum(cheonsu); // 상괘(외괘): 천수
  const haGua   = getGuaNum(jisu);   // 하괘(내괘): 지수
  // GUA_TABLE_FULL: 행=상괘(0-based), 열=하괘(0-based)
  const guaNo = GUA_TABLE_FULL[sangGua - 1][haGua - 1];
  return { guaNo, sangGua, haGua };
}

// ─── 6. 원당효(元堂爻) 계산 ───────────────────────────────────
/**
 * 원당효: (천수 + 지수) ÷ 6 나머지
 * 나머지 0 → 6효
 */
export function calcWondang(cheonsu, jisu) {
  const total = cheonsu + jisu;
  const r = total % 6;
  return r === 0 ? 6 : r;
}

// ─── 7. 후천괘 계산 ───────────────────────────────────────────
/**
 * 후천괘: 선천괘의 원당효를 변효(陰↔陽)하여 도출
 * 원당효 위치의 효를 뒤집은 새 괘
 */
export function calcHucheon(guaNo, wondangYao) {
  const lines = [...GUA_LINES[guaNo]]; // 복사 [초효..상효]
  const idx = wondangYao - 1;          // 0-based
  lines[idx] = lines[idx] === 1 ? 0 : 1;

  // 변효된 lines로 괘 번호 찾기
  for (const [num, gl] of Object.entries(GUA_LINES)) {
    if (gl.every((v, i) => v === lines[i])) return Number(num);
  }
  return guaNo; // fallback
}

// ─── 8. 유년괘(流年卦) 계산 ───────────────────────────────────
/**
 * 유년괘: 해당 나이의 효 위치로 1년 운세 확인
 * 원당효를 기점으로 나이가 들수록 위로 이동
 * 양효=9년, 음효=6년 지배
 * @param {number} guaNo       선천괘 번호
 * @param {number} wondang     원당효 (1~6)
 * @param {number} birthYear   태어난 해
 * @param {number} currentYear 현재 해
 * @returns {{ guaNo, yaoPos, isHucheon, age }}
 */
export function calcYunnyeon(guaNo, wondang, birthYear, currentYear) {
  const age = currentYear - birthYear + 1; // 한국 나이
  const lines = GUA_LINES[guaNo];
  let accumulated = 0;
  let currentYao = wondang - 1; // 0-based 시작점

  // 원당효부터 나이 누적
  let idx = wondang - 1;
  while (accumulated < age - 1) {
    const years = lines[idx] === 1 ? 9 : 6;
    if (accumulated + years >= age - 1) break;
    accumulated += years;
    idx = (idx + 1) % 6;
    // 6효 초과 시 후천괘로 이동 (간략 처리: guaNo 유지)
    if (idx === 0) idx = 0;
  }

  return {
    guaNo,
    yaoPos: idx + 1, // 1-based
    age,
  };
}

// ─── 9. 대운 타임라인 생성 ────────────────────────────────────
/**
 * 원당효부터 시작해 양효=9년, 음효=6년씩 올라가며
 * 전 생애 타임라인 배열 생성
 * @param {number} seoncheonGua  선천괘 번호
 * @param {number} hucheonGua    후천괘 번호
 * @param {number} wondang       원당효
 * @param {number} birthYear     태어난 해
 */
export function buildTimeline(seoncheonGua, hucheonGua, wondang, birthYear) {
  const timeline = [];
  let currentAge = 1;
  let gua = seoncheonGua;
  let yaoIdx = wondang - 1; // 0-based
  let isHucheon = false;
  let passedSeoncheon = 0;

  for (let step = 0; step < 12; step++) {
    const lines = GUA_LINES[gua];
    const yaoType = lines[yaoIdx] === 1 ? 'yang' : 'yin';
    const years = yaoType === 'yang' ? 9 : 6;

    timeline.push({
      gua,
      yaoPos: yaoIdx + 1,
      yaoType,
      years,
      startAge: currentAge,
      endAge: currentAge + years - 1,
      startYear: birthYear + currentAge - 1,
      endYear: birthYear + currentAge + years - 2,
      isHucheon,
    });

    currentAge += years;
    yaoIdx = (yaoIdx + 1) % 6;

    // 선천괘 6효 다 돌면 후천괘로 전환
    if (!isHucheon) {
      passedSeoncheon++;
      if (passedSeoncheon >= 6 - (wondang - 1)) {
        isHucheon = true;
        gua = hucheonGua;
        yaoIdx = 0;
      }
    }

    if (currentAge > 100) break;
  }

  return timeline;
}
