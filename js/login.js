/* login.js */

document.addEventListener("DOMContentLoaded", function () {
    updateLoginUI(); // 모든 페이지에서 실행
  
    const loginContainer = document.getElementById("login-container");
  
    // login.html 가져오기
    fetch("login.html")
        .then(response => response.text())
        .then(data => {
            console.log("login.html 로드 성공!");
            loginContainer.innerHTML = data;
            attachEventListeners();
            updateLoginUI();
        })
        .catch(error => console.error("login.html 로드 실패:", error));
  
    function attachEventListeners() {
        console.log("이벤트 리스너 추가됨!");
  
        document.addEventListener("click", function (event) {
            const modal = document.getElementById("login-modal");
  
            if (event.target.id === "login-btn") {
                event.preventDefault();
                if (modal) modal.style.display = "flex"; // 모달 띄우기
            }
            if (event.target.id === "close-modal") {
                if (modal) modal.style.display = "none"; // 모달 숨기기
            }
            if (event.target.classList.contains("modal-overlay")) {
                if (modal) modal.style.display = "none"; // 배경 클릭하면 닫기
            }
        });
  
        // 이메일 입력 시 유효성 검사
        document.getElementById("email").addEventListener("input", function () {
            validateEmail();
        });
  
        // 로그인 폼 제출 처리
        document.addEventListener("submit", function (event) {
            if (event.target.tagName === "FORM") {
                event.preventDefault();
                if (validateEmail()) {
                    handleLogin();
                }
            }
        });
  
        // 마이페이지 버튼 클릭 이벤트 추가 (로그인 여부 확인)
        const mypageBtn = document.getElementById("mypage-btn");
        if (mypageBtn) {
            mypageBtn.addEventListener("click", function (event) {
                checkLoginBeforeRedirect(event, "mypage.html");
            });
        }
  
        // 예매 버튼 클릭 이벤트 추가 (동적 요소 대응)
        document.addEventListener("click", function (event) {
            if (event.target.classList.contains("booking-btn")) {
                event.preventDefault();
                checkLoginBeforeRedirect(event, event.target.href);
            }
        });
    }
  });
  
  function validateEmail() {
      const emailInput = document.getElementById("email");
      const emailError = document.getElementById("email-error");
  
      if (!emailError) return;
  
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
      if (!emailPattern.test(emailInput.value)) {
          emailError.textContent = "올바른 이메일 형식이 아닙니다.";
          emailError.style.color = "red";
          return false;
      } else {
          emailError.textContent = "";
          return true;
      }
  }
  
  async function handleLogin() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      try {
          const response = await axios.post("http://localhost:8080/tokenLogin", {
              email: email,
              pwd: password
          });
  
          const loginData = response.data;
  
          if (response.status === 200) {
              if (loginData.redirect) {
                  if (confirm("회원이 아니시군요. 회원가입을 먼저 진행해주세요!")) {
                      window.location.href = loginData.redirect;
                  }
                  return;
              }
  
              if (loginData.msg) {
                  alert(loginData.msg);
                  return;
              }
  
              sessionStorage.setItem("Authorization", loginData.Authorization);
              sessionStorage.setItem("username", loginData.username);
  
              alert(`로그인 성공! ${loginData.username}님 환영합니다.`);
              updateLoginUI();
              document.getElementById("login-modal").style.display = "none";
          }
      } catch (error) {
          alert("로그인 중 오류가 발생했습니다.");
      }
  }
  