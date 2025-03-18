document.addEventListener("DOMContentLoaded", function () {
  const loginContainer = document.getElementById("login-container");

  // login.html 가져오기
  fetch("login.html")
      .then(response => response.text())
      .then(data => {
          console.log("login.html 로드 성공!");
          loginContainer.innerHTML = data;
          attachEventListeners();
          updateLoginUI(); // 로그인 상태 업데이트
      })
      .catch(error => console.error("login.html 로드 실패:", error));

  function attachEventListeners() {
      console.log("이벤트 리스너 추가됨!");

      document.addEventListener("click", function(event) {
          const modal = document.getElementById("login-modal");

          if (event.target.id === "login-btn") {
              event.preventDefault();
              if (modal) modal.style.display = "flex";  // 모달 띄우기
          }
          if (event.target.id === "close-modal") {
              if (modal) modal.style.display = "none";  // 모달 숨기기
          }
          if (event.target.classList.contains("modal-overlay")) {
              if (modal) modal.style.display = "none";  // 배경 클릭하면 닫기
          }
      });

      // 로그인 폼 제출 처리
      document.addEventListener("submit", function(event) {
          if (event.target.tagName === "FORM") {
              event.preventDefault();  // 기본 폼 제출 방지
              handleLogin();
          }
      });
  }

  async function handleLogin() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
          const response = await axios.post("http://localhost:8080/tokenLogin", {
              email: email,
              pwd: password
          });

          if (response.status === 200) {
              const loginData = response.data; // 응답 데이터 (Login 객체)
              const token = loginData.Authorization; // 토큰 추출
              const username = loginData.username; // 사용자 이름 (닉네임)

              // 세션 스토리지에 저장
              sessionStorage.setItem("Authorization", token);
              sessionStorage.setItem("username", username);

              // 로그인 성공 메시지
              alert(`로그인 성공! ${username}님 환영합니다.`);

              // 로그인 UI 업데이트
              updateLoginUI();

              // 모달 닫기
              document.getElementById("login-modal").style.display = "none";
          } else {
              alert("로그인 실패: " + (response.data.msg || "다시 시도해주세요."));
          }
      } catch (error) {
          console.error("로그인 오류:", error);
          alert("로그인 중 오류가 발생했습니다.");
      }
  }

  function updateLoginUI() {
      const loginBtn = document.getElementById("login-btn");
      const registerBtn = document.getElementById("register-btn");
      const mypageBtn = document.getElementById("mypage-btn");

      const token = sessionStorage.getItem("Authorization");
      const username = sessionStorage.getItem("username");

      if (token && username) {
          // 로그인 UI 변경
          loginBtn.style.display = "none";
          registerBtn.style.display = "none";
          mypageBtn.innerHTML = `${username}님`;
          mypageBtn.href = "#"; // 마이페이지 이동 가능하게 설정

          // 로그아웃 버튼 추가 (없다면 추가)
          if (!document.getElementById("logout-btn")) {
              mypageBtn.insertAdjacentHTML("afterend", '<a href="#" id="logout-btn" class="btn btn-link text-white">로그아웃</a>');
              document.getElementById("logout-btn").addEventListener("click", handleLogout);
          }
      }
  }

  async function handleLogout() {
    try {
        const token = sessionStorage.getItem("Authorization");

        if (!token) {
            alert("이미 로그아웃된 상태입니다.");
            return;
        }

        await axios.post("http://localhost:8080/logout", {}, {
            headers: {
                "Authorization": token, // Bearer 제거
                "Content-Type": "application/json"
            },
            withCredentials: true // CORS 인증 문제 해결
        });

        // 세션 스토리지에서 삭제
        sessionStorage.removeItem("Authorization");
        sessionStorage.removeItem("username");

        alert("로그아웃 되었습니다.");
        location.reload();
    } catch (error) {
        console.error("로그아웃 오류:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
    }
}




  // 페이지 로드 시 로그인 상태 확인
  updateLoginUI();
});
