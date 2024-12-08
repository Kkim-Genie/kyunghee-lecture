async function handleLogin(event) {
  event.preventDefault(); // 폼의 기본 제출 동작을 막습니다

  // 입력값 가져오기
  const userId = document.getElementById("userId").value;
  const password = document.getElementById("password").value;

  const response = await fetch(
    `http://localhost:3000/login?id=${userId}&pw=${password}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status === 200) window.alert("로그인 성공!");
  else if (response.status === 401) window.alert("로그인 실패");
}
