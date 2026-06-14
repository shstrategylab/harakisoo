/**
 * manse.js
 * 만세력 계산 모듈
 * - 양력 생년월일 → 천간지지 8글자(사주팔자) 변환
 * - manse_100_db.json + solar_terms_db.json 활용
 * - daily_cache 범위(2023~2027) 밖은 60갑자 역산으로 처리
 */

// ─── 60갑자 배열 ──────────────────────────────────────────────
const GANJI_60 = [
  '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
];

// 기준점: 2024-01-01 = 甲子(index 0)
const BASE_DATE = new Date('2024-01-01');
const BASE_IDX  = 0;

// ─── 날짜 → 일진(일주) 계산 ──────────────────────────────────
export function getDayGanji(dateStr, dailyCache) {
  // 1순위: daily_cache 직접 조회
  if (dailyCache && dailyCache[dateStr]) {
    const g = dailyCache[dateStr];
    return { gan: g[0], ji: g[1] };
  }
  // 2순위: 60갑자 역산
  const target = new Date(dateStr);
  const diffDays = Math.round((target - BASE_DATE) / 86400000);
  const idx = ((BASE_IDX + diffDays) % 60 + 60) % 60;
  const g = GANJI_60[idx];
  return { gan: g[0], ji: g[1] };
}

// ─── 연주(年柱) 계산 ──────────────────────────────────────────
// 명리학 기준: 해당 년도 입춘 이후 = 그 해 연주
// 입춘 전 = 전년도 연주
export function getYearGanji(year, month, day, solarTerms) {
  // 해당 년도 입춘 날짜 찾기
  const ipchun = solarTerms.find(
    t => t.name === '입춘' && t.date.startsWith(String(year))
  );
  let targetYear = year;
  if (ipchun) {
    const ipDate = new Date(ipchun.date);
    const birthDate = new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
    if (birthDate < ipDate) targetYear = year - 1;
  }
  // 연주: 갑자(1984)기준 60갑자 순환
  const baseYear = 1984; // 甲子년
  const diff = ((targetYear - baseYear) % 60 + 60) % 60;
  const g = GANJI_60[diff];
  return { gan: g[0], ji: g[1] };
}

// ─── 월주(月柱) 계산 ──────────────────────────────────────────
// 절기 기준으로 월 결정 (24절기 중 12절입 사용)
const MONTH_TERMS = ['소한','입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설'];

export function getMonthGanji(year, month, day, yearGan, solarTerms) {
  // 해당 날짜가 속하는 절기 월 결정
  const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const birthDate = new Date(dateStr);

  // 절기 월 번호 (0=1월건, 11=12월축)
  let monthNo = 0;
  const relevantTerms = solarTerms
    .filter(t => MONTH_TERMS.includes(t.name))
    .filter(t => {
      const y = parseInt(t.date.slice(0,4));
      return y >= year - 1 && y <= year + 1;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  for (let i = relevantTerms.length - 1; i >= 0; i--) {
    if (new Date(relevantTerms[i].date) <= birthDate) {
      monthNo = MONTH_TERMS.indexOf(relevantTerms[i].name);
      break;
    }
  }

  // 월간 계산: 연간에 따른 월간 시작
  const MONTH_GAN_START = { 甲:2, 乙:4, 丙:6, 丁:8, 戊:10, 己:2, 庚:4, 辛:6, 壬:8, 癸:10 };
  // 天干五虎遁: 갑기년→병인월시작, 을경년→무인월, 병신년→경인월, 정임년→임인월, 무계년→갑인월
  const MONTH_GAN_MAP = {
    甲: ['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
    己: ['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
    乙: ['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
    庚: ['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
    丙: ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
    辛: ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
    丁: ['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
    壬: ['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
    戊: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
    癸: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
  };

  // 월지: 인(寅)월=1월건부터 시작
  const MONTH_JI = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

  const ganArr = MONTH_GAN_MAP[yearGan] || MONTH_GAN_MAP['甲'];
  return {
    gan: ganArr[monthNo],
    ji: MONTH_JI[monthNo],
  };
}

// ─── 시주(時柱) 계산 ──────────────────────────────────────────
// 자시(23~01), 축시(01~03), 인시(03~05), 묘시(05~07),
// 진시(07~09), 사시(09~11), 오시(11~13), 미시(13~15),
// 신시(15~17), 유시(17~19), 술시(19~21), 해시(21~23)
const HOUR_JI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

export function getHourJi(hour, isYajasiNext = false) {
  // 야자시(0~1시): 전날 자시 vs 당일 자시 구분
  // isYajasiNext=true → 다음날 자시(자정 이후 = 새 날의 자시로 처리)
  let h = hour;
  if (h === 23) return '子';
  const idx = Math.floor((h + 1) / 2);
  return HOUR_JI[Math.min(idx, 11)];
}

export function getHourGanji(hour, dayGan, isYajasiNext = false) {
  const HOUR_GAN_MAP = {
    甲: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
    己: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'],
    乙: ['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
    庚: ['丙','丁','戊','己','庚','辛','壬','癸','甲','乙','丙','丁'],
    丙: ['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
    辛: ['戊','己','庚','辛','壬','癸','甲','乙','丙','丁','戊','己'],
    丁: ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
    壬: ['庚','辛','壬','癸','甲','乙','丙','丁','戊','己','庚','辛'],
    戊: ['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
    癸: ['壬','癸','甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  };

  const ji = getHourJi(hour, isYajasiNext);
  const jiIdx = HOUR_JI.indexOf(ji);
  const ganArr = HOUR_GAN_MAP[dayGan] || HOUR_GAN_MAP['甲'];
  return { gan: ganArr[jiIdx], ji };
}

// ─── 메인: 생년월일시 → 사주팔자 8글자 ───────────────────────
/**
 * @param {object} params
 * @param {number} params.year      양력 년
 * @param {number} params.month     양력 월
 * @param {number} params.day       양력 일
 * @param {number} params.hour      시 (0~23, 모르면 12)
 * @param {boolean} params.isYajasiNext 야자시(밤 11시~자정) 다음날로 처리 여부
 * @param {object} params.manseDB   manse_100_db.json 데이터
 * @param {Array}  params.solarTerms solar_terms_db.json 데이터
 * @returns {{ yearGanji, monthGanji, dayGanji, hourGanji, ganji8 }}
 */
export function calcSaju(params) {
  const { year, month, day, hour = 12, isYajasiNext = false, manseDB, solarTerms } = params;

  const yearGanji  = getYearGanji(year, month, day, solarTerms);
  const monthGanji = getMonthGanji(year, month, day, yearGanji.gan, solarTerms);

  const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const dayGanji  = getDayGanji(dateStr, manseDB?.daily_cache);
  const hourGanji = getHourGanji(hour, dayGanji.gan, isYajasiNext);

  const ganji8 = [
    yearGanji.gan,  yearGanji.ji,
    monthGanji.gan, monthGanji.ji,
    dayGanji.gan,   dayGanji.ji,
    hourGanji.gan,  hourGanji.ji,
  ];

  return { yearGanji, monthGanji, dayGanji, hourGanji, ganji8 };
}
