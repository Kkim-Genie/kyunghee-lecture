// 필요한 패키지 설치:
// npm install openai dotenv

require("dotenv").config();
const OpenAI = require("openai");

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getChatGPTResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// 사용 예제
async function main() {
  try {
    const prompt = "Node.js란 무엇인가요?";
    console.log("질문:", prompt);

    const response = await getChatGPTResponse(prompt);
    console.log("ChatGPT 응답:", response);
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
