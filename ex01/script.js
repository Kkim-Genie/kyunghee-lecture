function handleLogin(event) {
  event.preventDefault(); // 폼의 기본 제출 동작을 막습니다

  // 입력값 가져오기
  const userId = document.getElementById("userId").value;
  const password = document.getElementById("password").value;

  // 콘솔에 출력
  console.log("User ID:", userId);
  console.log("Password:", password);
}
