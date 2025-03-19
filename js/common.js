document.addEventListener("DOMContentLoaded", function () {
    updateLoginUI();
  });
  
  async function handleLogout() {
      try {
          const token = sessionStorage.getItem("Authorization");
  
          if (!token) {
              alert("이미 로그아웃된 상태입니다.");
              return;
          }
  
          await axios.post("http://localhost:8080/logout", {}, {
              headers: {
                  "Authorization": token,
                  "Content-Type": "application/json"
              },
              withCredentials: true
          });
  
          sessionStorage.removeItem("Authorization");
          sessionStorage.removeItem("username");
  
          alert("로그아웃 되었습니다.");
          location.reload();
      } catch (error) {
          if (error.response && error.response.status === 401) {
              sessionStorage.removeItem("Authorization");
              sessionStorage.removeItem("username");
              alert("세션이 만료되었습니다. 다시 로그인해주세요.");
              location.reload();
          } else {
              alert("로그아웃 중 오류가 발생했습니다.");
          }
      }
  }
  
  function updateLoginUI() {
      const loginBtn = document.getElementById("login-btn");
      const registerBtn = document.getElementById("register-btn");
      const mypageBtn = document.getElementById("mypage-btn");
      const headerButtons = document.getElementById("header-buttons");
  
      const token = sessionStorage.getItem("Authorization");
      const username = sessionStorage.getItem("username");
  
      if (token && username) {
          loginBtn.style.display = "none";
          registerBtn.style.display = "none";
          mypageBtn.innerHTML = `${username}님`;
          mypageBtn.href = "#";
  
          if (!document.getElementById("logout-btn")) {
              mypageBtn.insertAdjacentHTML("afterend", '<a href="#" id="logout-btn" class="btn btn-link text-white">로그아웃</a>');
              document.getElementById("logout-btn").addEventListener("click", handleLogout);
          }
      }
  
      if (headerButtons) {
          headerButtons.classList.remove("hidden");
      }
  }
  
// 세션 체크 함수
async function checkSession() {
    const token = sessionStorage.getItem("Authorization");

    if (!token) return false;

    try {
        await axios.get("http://localhost:8080/checkSession", {
            headers: { "Authorization": token },
            withCredentials: true
        });
        return true;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem("Authorization");
            sessionStorage.removeItem("username");
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");

            // 로그인 모달 띄우기 상태 저장
            sessionStorage.setItem("showLoginModal", "true");

            location.reload(); // 새로고침
            return false;
        }
        return true;
    }
}

// 로그인 체크 후 리디렉트
async function checkLoginBeforeRedirect(event, redirectUrl) {
    event.preventDefault();
    const token = sessionStorage.getItem("Authorization");

    if (!token) {
        alert("로그인을 먼저 해주세요.");

        // 로그인 모달 띄우기 상태 저장
        sessionStorage.setItem("showLoginModal", "true");

        location.reload(); // 새로고침
        return;
    }

    const isSessionValid = await checkSession();
    if (isSessionValid) {
        window.location.href = redirectUrl;
    } else {
        // 로그인 모달 띄우기 상태 저장
        sessionStorage.setItem("showLoginModal", "true");

        location.reload(); // 새로고침
    }
}

// 새로고침 후 로그인 모달 자동 띄우기
document.addEventListener("DOMContentLoaded", function () {
    if (sessionStorage.getItem("showLoginModal") === "true") {
        setTimeout(() => {
            const loginModal = document.getElementById("login-modal");
            if (loginModal) {
                loginModal.style.display = "flex"; // 로그인 모달 띄우기
                sessionStorage.removeItem("showLoginModal"); // 상태는 지워주기
            }
        }, 500); // 모달 로드될 수 있도록 약간 대기
    }
});
