document.addEventListener("DOMContentLoaded", () => {
  const todoForm = document.getElementById("todo-form");
  const todoContentInput = document.getElementById("todo-content");
  const todoDateInput = document.getElementById("todo-date");
  const todoPriorityInput = document.getElementById("todo-priority");
  const todoCreateMessage = document.getElementById("todo-create-message");

  // 오늘 날짜를 기본값으로 설정
  const today = new Date().toISOString().split("T")[0];
  todoDateInput.value = today;
  todoDateInput.min = today;

  todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const todoData = {
      content: todoContentInput.value.trim(),
      date: todoDateInput.value,
      priority: todoPriorityInput.value,
      completed: false,
    };

    try {
      const response = await fetch("http://localhost:3000/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error("Todo 생성에 실패했습니다.");
      }

      const newTodo = await response.json();

      // 성공 메시지 표시
      todoCreateMessage.textContent = "Todo가 성공적으로 생성되었습니다!";
      todoCreateMessage.style.color = "green";

      // 폼 초기화
      todoForm.reset();
      todoDateInput.value = today;
    } catch (error) {
      console.error("Todo 생성 중 오류:", error);
      todoCreateMessage.textContent = error.message;
      todoCreateMessage.style.color = "red";
    }
  });
});
