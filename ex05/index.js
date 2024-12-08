// weather-data.js
const weatherData = [
  {
    region: "서울",
    locations: [
      {
        name: "강남구",
        data: {
          temperature: 18,
          humidity: 60,
          condition: "맑음",
          windSpeed: 3.5,
        },
      },
      {
        name: "마포구",
        data: {
          temperature: 17,
          humidity: 65,
          condition: "구름많음",
          windSpeed: 4.0,
        },
      },
    ],
  },
  {
    region: "부산",
    locations: [
      {
        name: "해운대구",
        data: {
          temperature: 20,
          humidity: 70,
          condition: "흐림",
          windSpeed: 5.5,
        },
      },
      {
        name: "수영구",
        data: {
          temperature: 19,
          humidity: 75,
          condition: "비",
          windSpeed: 6.0,
        },
      },
    ],
  },
];

// app.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 날씨 정보를 조회하는 함수 정의
const getWeatherInfo = (region, location) => {
  const regionData = weatherData.find((r) => r.region === region);
  if (!regionData) return null;

  const locationData = regionData.locations.find((l) => l.name === location);
  return locationData?.data || null;
};

// Function calling 정의
const functions = [
  {
    name: "get_weather",
    description: "특정 지역의 날씨 정보를 조회합니다",
    parameters: {
      type: "object",
      properties: {
        region: {
          type: "string",
          description: "날씨를 조회할 광역시/도",
        },
        location: {
          type: "string",
          description: "날씨를 조회할 구/군",
        },
      },
      required: ["region", "location"],
    },
  },
];

async function getChatCompletion(userMessage) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
      functions: functions,
      function_call: "auto",
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      if (functionName === "get_weather") {
        const weatherInfo = getWeatherInfo(
          functionArgs.region,
          functionArgs.location
        );

        if (!weatherInfo) {
          return "해당 지역의 날씨 정보를 찾을 수 없습니다.";
        }

        // 날씨 정보를 기반으로 한 두 번째 응답 생성
        const secondResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "user", content: userMessage },
            responseMessage,
            {
              role: "function",
              name: "get_weather",
              content: JSON.stringify(weatherInfo),
            },
          ],
        });

        return secondResponse.choices[0].message.content;
      }
    }

    return responseMessage.content;
  } catch (error) {
    console.error("Error:", error);
    return "오류가 발생했습니다.";
  }
}

// 사용 예제
async function main() {
  const userQuery = "서울 강남구의 날씨가 어때?";
  const response = await getChatCompletion(userQuery);
  console.log("응답:", response);
}

main();
