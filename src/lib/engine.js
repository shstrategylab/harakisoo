/**
 * engine.js
 * 하락이수 통합 계산 엔진
 * calcSaju → calcSuri → calcGua → calcWondang → calcHucheon → buildTimeline → calcYunnyeon
 * 모든 단계를 한 번에 실행하고 결과 객체 반환
 */

import { calcSaju } from './manse.js';
import {
  calcSuri, calcGua, calcWondang, calcHucheon, buildTimeline, calcYunnyeon,
  GUA_LINES,
} from './harakisu_core.js';

/**
 * @param {object} input
 * @param {number}  input.year
 * @param {number}  input.month
 * @param {number}  input.day
 * @param {number}  input.hour        (0~23, 모를 때 12)
 * @param {string}  input.gender      'male' | 'female'
 * @param {boolean} input.isYajasiNext 야자시 다음날 처리 여부
 * @param {object}  input.manseDB     manse_100_db.json
 * @param {Array}   input.solarTerms  solar_terms_db.json
 * @param {number}  input.currentYear 올해 연도 (기본: 현재 연도)
 */
export function calcHarakisu(input) {
  const {
    year, month, day, hour = 12,
    gender = 'male',
    isYajasiNext = false,
    manseDB,
    solarTerms,
    currentYear = new Date().getFullYear(),
  } = input;

  // ① 사주팔자 도출
  const saju = calcSaju({ year, month, day, hour, isYajasiNext, manseDB, solarTerms });

  // ② 수리 변환
  const suri = calcSuri(saju.ganji8);

  // ③ 선천괘 도출
  //    남성: 천수→상괘, 지수→하괘 / 여성: 반대로 적용 (하락이수 원칙)
  const cheonsuFinal = gender === 'male' ? suri.cheonsu : suri.jisu;
  const jisuFinal    = gender === 'male' ? suri.jisu    : suri.cheonsu;
  const seoncheonResult = calcGua(cheonsuFinal, jisuFinal);

  // ④ 원당효
  const wondang = calcWondang(suri.cheonsu, suri.jisu);

  // ⑤ 후천괘 (원당효 변효)
  const hucheonGuaNo = calcHucheon(seoncheonResult.guaNo, wondang);

  // ⑥ 대운 타임라인
  const timeline = buildTimeline(seoncheonResult.guaNo, hucheonGuaNo, wondang, year);

  // ⑦ 올해 유년괘
  const yunnyeon = calcYunnyeon(seoncheonResult.guaNo, wondang, year, currentYear);

  return {
    // 입력
    birthYear: year, birthMonth: month, birthDay: day, birthHour: hour,
    gender, currentYear,
    // 사주
    saju,
    // 수리
    suri: { ...suri, cheonsuFinal, jisuFinal },
    // 괘
    seoncheon: seoncheonResult,
    hucheon: { guaNo: hucheonGuaNo },
    wondang,
    yunnyeon,
    timeline,
    // 원본 lines (효 음양 정보)
    seoncheonLines: GUA_LINES[seoncheonResult.guaNo],
    hucheonLines:   GUA_LINES[hucheonGuaNo],
  };
}
