/**
 * prompt_builder.js
 * 하락이수 풀이 결과를 바탕으로
 * Claude 대화창에 붙여넣을 프롬프트를 자동 생성
 */

/**
 * @param {object} result  calcHarakisu() 반환값
 * @param {object} guaDB   iching_dansa.json
 * @param {object} yaoDBs  iching_384_korean.json
 * @param {string} question 사용자 추가 질문 (선택)
 */
export function buildPrompt(result, guaDB, yaoDB, question = '') {
  const {
    saju,
    seoncheon,
    hucheon,
    wondang,
    yunnyeon,
    timeline,
    gender,
    birthYear,
    currentYear,
  } = result;

  const sc = guaDB[seoncheon.guaNo];
  const hc = guaDB[hucheon.guaNo];
  const yy = guaDB[yunnyeon.guaNo];

  const scYao = yaoDB[seoncheon.guaNo]?.lines[wondang];
  const yyYao = yaoDB[yunnyeon.guaNo]?.lines[yunnyeon.yaoPos];

  const koreanAge = currentYear - birthYear + 1;
  const genderStr = gender === 'male' ? '남성' : '여성';

  // 현재 대운 찾기
  const currentDayun = timeline.find(t =>
    koreanAge >= t.startAge && koreanAge <= t.endAge
  );

  const prompt = `당신은 하락이수(河洛理數) 전문 상담사입니다.
아래는 내담자의 하락이수 분석 결과입니다. 이 데이터를 바탕으로 구체적인 풀이와 행동 지침, 심리 처방을 제공해 주세요.

━━━━━━━━━━━━━━━━━━━━━━
【 내담자 기본 정보 】
━━━━━━━━━━━━━━━━━━━━━━
성별: ${genderStr}
생년: ${birthYear}년
현재 나이: ${koreanAge}세 (${currentYear}년 기준)
사주팔자: ${saju.ganji8.join(' ')}
일간(日干): ${saju.ganji8[4]}

━━━━━━━━━━━━━━━━━━━━━━
【 선천괘 (인생 전반) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${seoncheon.guaNo}번 ${sc?.name ?? ''}
괘사: ${sc?.dansa ?? ''}
상전: ${sc?.sangjeon ?? ''}
원당효: ${wondang}효
원당효사: ${scYao?.text_ko ?? ''}
원당효 해설: ${scYao?.comment_ko ?? ''}

━━━━━━━━━━━━━━━━━━━━━━
【 후천괘 (인생 후반) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${hucheon.guaNo}번 ${hc?.name ?? ''}
괘사: ${hc?.dansa ?? ''}
상전: ${hc?.sangjeon ?? ''}

━━━━━━━━━━━━━━━━━━━━━━
【 올해 유년괘 (${currentYear}년) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${yunnyeon.guaNo}번 ${yy?.name ?? ''} ${yunnyeon.yaoPos}효
효사: ${yyYao?.text_ko ?? ''}
해설: ${yyYao?.comment_ko ?? ''}

━━━━━━━━━━━━━━━━━━━━━━
【 현재 대운 】
━━━━━━━━━━━━━━━━━━━━━━
${currentDayun
  ? `${currentDayun.startAge}세~${currentDayun.endAge}세 / ${currentDayun.guaNo}번 괘 ${currentDayun.yaoPos}효 (${currentDayun.yaoType === 'yang' ? '양효 9년' : '음효 6년'} 지배)`
  : '대운 정보 없음'}

━━━━━━━━━━━━━━━━━━━━━━
【 풀이 요청 사항 】
━━━━━━━━━━━━━━━━━━━━━━
${question
  ? question
  : `위 정보를 바탕으로 다음 내용을 풀이해 주세요:
1. 선천괘와 원당효를 통한 핵심 성향 및 인생 전반의 흐름
2. 후천괘를 통한 인생 후반의 방향성
3. 올해(${currentYear}년) 유년괘 기반 구체적 행동 지침
4. 현재 대운 에너지에서 해야 할 일과 피해야 할 일
5. 심리 처방 한 마디 (위로 또는 경계)`}
`;

  return prompt.trim();
}
