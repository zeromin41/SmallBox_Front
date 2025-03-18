document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // 기본 폼 제출 방지

    // 입력값 가져오기
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // 유효성 검사
    if (
      !validateEmail(email) ||
      !validateUsername(username) ||
      !validatePassword(password)
    ) {
      return;
    }

    try {
      // 백엔드에 회원가입 요청
      const response = await axios.post("http://localhost:8080/insertMember", {
        email: email,
        userName: username,
        pwd: password,
      });

      if (message.includes("축하")) {
        alert("회원가입이 완료되었습니다.");
        window.location.href = "index.html"; // 회원가입 성공 시 로그인 페이지로 이동
      } else if (message.includes("이미 가입된 이메일")) {
        alert("이미 존재하는 이메일입니다. 로그인을 진행해 주세요.");
        document.getElementById("email-error").textContent =
          "이미 가입된 이메일입니다.";
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      alert("회원가입 요청 실패 : 회원가입 중 오류가 발생했습니다.");
      // console.error("회원가입 오류:", error);
    }
  });
});

// 이메일 유효성 검사
function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const emailError = document.getElementById("email-error");

  if (!emailPattern.test(email)) {
    emailError.textContent = "올바른 이메일 형식이 아닙니다.";
    return false;
  } else {
    emailError.textContent = "";
    return true;
  }
}

// 사용자 이름 유효성 검사
function validateUsername(username) {
  const usernameError = document.getElementById("username-error");

  if (username.length < 2) {
    usernameError.textContent = "이름은 최소 2자 이상이어야 합니다.";
    return false;
  } else {
    usernameError.textContent = "";
    return true;
  }
}

// 비밀번호 유효성 검사
function validatePassword(password) {
  const passwordError = document.getElementById("password-error");
  const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+]).{8,}$/;

  if (!passwordPattern.test(password)) {
    passwordError.textContent =
      "비밀번호는 8자 이상, 숫자 및 특수문자를 포함해야 합니다.";
    return false;
  } else {
    passwordError.textContent = "";
    return true;
  }
}
