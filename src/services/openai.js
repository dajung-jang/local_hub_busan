const API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-5-mini'

const SYSTEM_PROMPT = `당신은 지역 정보 공유 커뮤니티 'LocalHub'의 부산 지역 챗봇입니다.
반드시 아래 규칙을 지키세요.
1. 답변은 사용자 메시지와 함께 제공되는 [제공 데이터]에 근거해서만 작성하세요.
2. 제공 데이터에 없는 정보(정확한 날짜, 가격, 영업시간 등)는 추측하지 말고 "데이터에 없어 답변드리기 어려워요"라고 안내하세요.
3. 맛집/음식점 관련 질문에는 관련 데이터가 없다고 명확히 안내하세요.
4. 매우 중요: 답변은 딱 한 문장, 최대 40자 이내의 짧은 안내 문구로만 작성하세요.
   장소 이름, 주소, 목록은 화면에 별도로 표시되므로 절대 언급하거나 나열하지 마세요.
   예시(좋은 답변): "부산의 인기 축제를 모아봤어요!"
   예시(나쁜 답변): "부산에는 OO축제, XX박람회 등이 있습니다" (장소명을 언급했으므로 규칙 위반)`
   
export async function askChatbot(userMessage, contextText, history = []) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    {
      role: 'user',
      content: `[제공 데이터]\n${contextText}\n\n[사용자 질문]\n${userMessage}`,
    },
  ]

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_completion_tokens: 600, // 추론 토큰까지 포함되므로 여유있게 설정
      reasoning_effort: 'minimal', // 단순 QA라 깊은 추론 불필요 → 추론 토큰 낭비 방지
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`OPENAI_ERROR: ${response.status} ${errBody}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || '답변을 생성하지 못했어요.'
}