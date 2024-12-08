document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");
  const todoList = document.getElementById("todos");
  const selectedDateEl = document.getElementById("selected-date");

  // 현재 연도와 월 생성
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  function generateCalendar(year, month) {
    calendar.innerHTML = ""; // 기존 캘린더 초기화
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 달력 헤더
    const monthNames = [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ];
    const header = document.createElement("div");
    header.className = "calendar-header";
    header.textContent = `${monthNames[month]} ${year}`;
    calendar.appendChild(header);

    // 요일 헤더
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const daysRow = document.createElement("div");
    daysRow.className = "days-header";
    dayNames.forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.textContent = day;
      daysRow.appendChild(dayEl);
    });
    calendar.appendChild(daysRow);

    // 날짜 채우기
    const daysContainer = document.createElement("div");
    daysContainer.className = "days";

    // 첫 날 이전의 빈 칸
    for (let i = 0; i < firstDay.getDay(); i++) {
      const emptyDay = document.createElement("div");
      daysContainer.appendChild(emptyDay);
    }

    // 날짜 생성
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateEl = document.createElement("div");
      dateEl.textContent = day;
      dateEl.className = "day";

      const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      dateEl.setAttribute("data-date", fullDate);

      dateEl.addEventListener("click", () => fetchTodosForDate(fullDate));
      daysContainer.appendChild(dateEl);
    }

    calendar.appendChild(daysContainer);
  }

  // Todo 표시 함수 업데이트
  async function fetchTodosForDate(date) {
    try {
      const response = await fetch(`http://localhost:3000/api/todos/${date}`);
      const todos = await response.json();

      selectedDateEl.textContent = `${date} Todo 목록`;
      todoList.innerHTML = "";

      if (todos.length === 0) {
        const noTodoEl = document.createElement("li");
        noTodoEl.textContent = "해당 날짜에 Todo가 없습니다.";
        todoList.appendChild(noTodoEl);
        return;
      }

      todos.forEach((todo) => {
        const todoEl = document.createElement("li");
        todoEl.className = "todo-item";
        todoEl.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" ${todo.completed ? "checked" : ""} 
                           onchange="updateTodoStatus(${
                             todo.id
                           }, this.checked)">
                    <span class="${todo.completed ? "completed" : ""}">${
          todo.content
        }</span>
                </div>
                <button class="delete-btn" onclick="deleteTodo(${
                  todo.id
                })">삭제</button>
            `;
        todoList.appendChild(todoEl);
      });
    } catch (error) {
      console.error("Todo 불러오기 실패:", error);
    }
  }

  window.updateTodoStatus = async (id, completed) => {
    try {
      await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });
    } catch (error) {
      console.error("Todo 상태 업데이트 실패:", error);
    }
  };

  // Todo 삭제 함수 추가
  window.deleteTodo = async (id) => {
    if (!confirm("정말로 이 Todo를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 현재 표시된 날짜의 Todo 목록 새로고침
        const currentDate = document
          .getElementById("selected-date")
          .textContent.split(" ")[0];
        fetchTodosForDate(currentDate);
      } else {
        alert("Todo 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Todo 삭제 실패:", error);
      alert("Todo 삭제 중 오류가 발생했습니다.");
    }
  };

  generateCalendar(currentYear, currentMonth);
});
