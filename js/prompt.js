/**
 * prompt.js
 * 하락이수 풀이 결과 → Claude 상담 프롬프트 자동 생성
 */
function buildPrompt(result, question = '') {
  const { ganji8, sc, hc, wondang, wondangYao, yy, timeline, gender, birthYear, currentYear } = result;
  const korAge = currentYear - birthYear + 1;
  const cur    = timeline?.find(t => korAge >= t.startAge && korAge <= t.endAge);

  return `당신은 하락이수(河洛理數) 전문 상담사입니다. 아래 내담자 정보를 바탕으로 구체적인 풀이와 행동 지침, 심리 처방을 제공해 주세요.

━━━━━━━━━━━━━━━━━━━━━━
【 내담자 기본 정보 】
━━━━━━━━━━━━━━━━━━━━━━
성별: ${gender === 'male' ? '남성' : '여성'}
생년: ${birthYear}년 / 현재 나이: ${korAge}세 (${currentYear}년 기준)
사주팔자: ${ganji8.join(' ')}
일간(日干): ${ganji8[4]}

━━━━━━━━━━━━━━━━━━━━━━
【 선천괘 (인생 전반) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${sc.guaNo}번 ${sc.name || ''}
괘사: ${sc.dansa || ''}
상전: ${sc.sangjeon || ''}
원당효: ${wondang}효
원당효사: ${wondangYao?.text_ko || ''}
원당효 해설: ${wondangYao?.comment_ko || ''}

━━━━━━━━━━━━━━━━━━━━━━
【 후천괘 (인생 후반) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${hc.guaNo}번 ${hc.name || ''}
괘사: ${hc.dansa || ''}
상전: ${hc.sangjeon || ''}

━━━━━━━━━━━━━━━━━━━━━━
【 올해 유년괘 (${currentYear}년) 】
━━━━━━━━━━━━━━━━━━━━━━
괘 번호: ${yy.gua}번 ${yy.name || ''} ${yy.yaoPos}효
효사: ${yy.yaoData?.text_ko || ''}
해설: ${yy.yaoData?.comment_ko || ''}

━━━━━━━━━━━━━━━━━━━━━━
【 현재 대운 】
━━━━━━━━━━━━━━━━━━━━━━
${cur ? `${cur.startAge}~${cur.endAge}세 / ${cur.gua}번괘 ${cur.yaoPos}효 (${cur.yang ? '양효 9년' : '음효 6년'} 지배)` : ''}

━━━━━━━━━━━━━━━━━━━━━━
【 풀이 요청 사항 】
━━━━━━━━━━━━━━━━━━━━━━
${question || `위 정보를 바탕으로 다음을 풀이해 주세요:
1. 선천괘와 원당효를 통한 핵심 성향 및 인생 전반의 흐름
2. 후천괘를 통한 인생 후반의 방향성
3. 올해(${currentYear}년) 유년괘 기반 구체적 행동 지침
4. 현재 대운 에너지에서 해야 할 일과 피해야 할 일
5. 심리 처방 한 마디`}`.trim();
}

window.buildPrompt = buildPrompt;
