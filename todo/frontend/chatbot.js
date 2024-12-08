// OpenAI API Key (실제 프로젝트에서는 백엔드에서 관리해야 함)
const OPENAI_API_KEY = "OPENAI_API_KEY";

document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");

  // 오늘 날짜 포맷팅 함수
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 시스템 프롬프트 설정
  const systemPrompt = {
    role: "system",
    content: `You are a helpful Todo management assistant. Today's date is ${new Date().toLocaleDateString()}. 
        You can help users manage their todos by:
        1. Showing todos for specific dates
        2. Creating new todos
        3. Providing summaries of upcoming tasks
        4. Suggesting task organization
        
        When referring to dates, always consider today's date as the reference point.
        For example:
        - "today" refers to ${new Date().toLocaleDateString()}
        - "tomorrow" refers to ${new Date(
          Date.now() + 86400000
        ).toLocaleDateString()}
        - "next week" starts from ${new Date(
          Date.now() + 7 * 86400000
        ).toLocaleDateString()}
        
        Always try to be specific about dates when discussing todos.
        Respond in Korean unless specifically asked to use another language.`,
  };

  // Function calling 정의
  const functionDefinitions = [
    {
      name: "get_todos_for_date",
      description: "특정 날짜의 Todo 목록을 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "YYYY-MM-DD 형식의 날짜",
          },
        },
        required: ["date"],
      },
    },
    {
      name: "create_todo",
      description: "새로운 Todo를 생성합니다.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "Todo의 내용",
          },
          date: {
            type: "string",
            description: "YYYY-MM-DD 형식의 날짜",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Todo의 우선순위",
          },
        },
        required: ["content", "date"],
      },
    },
    {
      name: "delete_todo",
      description: "특정 Todo를 삭제합니다.",
      parameters: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "삭제할 Todo의 날짜",
          },
          content: {
            type: "string",
            description: "삭제할 Todo의 내용",
          },
        },

        required: ["date, content"],
      },
    },
  ];

  // 챗봇 메시지 추가 함수
  function addChatMessage(message, sender = "bot") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", sender);

    // 줄바꿈 처리
    const formattedMessage = message.replace(/\n/g, "<br>");
    messageElement.innerHTML = formattedMessage;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Todo 조회 함수
  async function getTodosForDate(date) {
    try {
      const response = await fetch(`http://localhost:3000/api/todos/${date}`);
      const todos = await response.json();

      if (todos.length === 0) {
        return `${date}에는 Todo가 없습니다.`;
      }

      const todosList = todos
        .map(
          (todo) => `- ${todo.content} (${todo.completed ? "완료" : "미완료"})`
        )
        .join("\n");

      return `${date} Todo 목록:\n${todosList}`;
    } catch (error) {
      console.error("Todo 조회 실패:", error);
      return "Todo 조회 중 오류가 발생했습니다.";
    }
  }

  // Todo 생성 함수
  async function createTodo(todoDetails) {
    try {
      const response = await fetch("http://localhost:3000/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: todoDetails.content,
          date: todoDetails.date,
          priority: todoDetails.priority || "medium",
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Todo 생성 실패");
      }

      const newTodo = await response.json();
      return `새로운 Todo가 생성되었습니다: ${newTodo.content} (${newTodo.date})`;
    } catch (error) {
      console.error("Todo 생성 실패:", error);
      return "Todo 생성 중 오류가 발생했습니다.";
    }
  }

  // Todo 삭제 함수
  async function deleteTodo(date, content) {
    const response = await fetch(`http://localhost:3000/api/todos/${date}`);
    const todos = await response.json();
    const target = todos.find((todo) => todo.content === content);
    if (!target) return "존재하지 않는 todo 입니다.";

    try {
      const response = await fetch(
        `http://localhost:3000/api/todos/${target.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Todo 삭제 실패");
      }

      return "Todo가 성공적으로 삭제되었습니다.";
    } catch (error) {
      console.error("Todo 삭제 실패:", error);
      return "Todo 삭제 중 오류가 발생했습니다.";
    }
  }

  // 날짜 표현식 파싱 함수
  function parseDateExpression(dateExpr) {
    const today = new Date();
    const koreanDays = {
      오늘: 0,
      내일: 1,
      모레: 2,
      다음주: 7,
    };

    // 한국어 날짜 표현 처리
    if (dateExpr in koreanDays) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + koreanDays[dateExpr]);
      return formatDate(targetDate);
    }

    // 영어 날짜 표현 처리
    const englishExpr = dateExpr.toLowerCase();
    if (englishExpr === "today") {
      return formatDate(today);
    } else if (englishExpr === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return formatDate(tomorrow);
    }

    // YYYY-MM-DD 형식의 날짜는 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateExpr)) {
      return dateExpr;
    }

    // 기본값으로 오늘 날짜 반환
    return formatDate(today);
  }

  // OpenAI API 호출 함수
  async function callOpenAI(userMessage) {
    const messages = [systemPrompt, { role: "user", content: userMessage }];

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            functions: functionDefinitions,
            function_call: "auto",
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API 호출 실패");
      }

      return await response.json();
    } catch (error) {
      console.error("OpenAI API 호출 실패:", error);
      return null;
    }
  }

  // 챗봇 메시지 처리 함수
  async function handleChatMessage(message) {
    try {
      const response = await callOpenAI(message);

      if (!response) {
        addChatMessage(
          "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
        return;
      }

      const { function_call } = response.choices[0].message;

      if (function_call) {
        const args = JSON.parse(function_call.arguments);

        // 날짜 파싱 처리
        if (args.date) {
          args.date = parseDateExpression(args.date);
        }

        let functionResponse;
        switch (function_call.name) {
          case "get_todos_for_date":
            functionResponse = await getTodosForDate(args.date);
            break;

          case "create_todo":
            functionResponse = await createTodo(args);
            break;

          case "delete_todo":
            functionResponse = await deleteTodo(args.date, args.content);
            break;

          default:
            functionResponse = "지원하지 않는 기능입니다.";
        }

        // 함수 실행 결과를 챗봇 응답으로 표시
        addChatMessage(functionResponse);

        // 추가 API 호출로 더 자연스러운 응답 생성
        const followUpResponse = await callOpenAI(
          `User requested: "${message}". The action was performed with result: "${functionResponse}". Please provide a natural follow-up response in Korean.`
        );

        if (followUpResponse && followUpResponse.choices[0].message.content) {
          addChatMessage(followUpResponse.choices[0].message.content);
        }
      } else {
        // 일반 대화 응답
        addChatMessage(response.choices[0].message.content);
      }
    } catch (error) {
      console.error("챗봇 처리 중 오류:", error);
      addChatMessage("죄송합니다. 요청을 처리하는 중에 오류가 발생했습니다.");
    }
  }

  // 시작 메시지 표시
  addChatMessage(
    "안녕하세요! Todo 관리를 도와드릴 수 있는 챗봇입니다. 어떤 도움이 필요하신가요?"
  );

  // 폼 제출 이벤트 처리
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    addChatMessage(message, "user");
    userInput.value = "";

    await handleChatMessage(message);
  });
});
