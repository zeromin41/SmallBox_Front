document.addEventListener("DOMContentLoaded", function () {
  updateLoginUI(); // 모든 페이지에서 실행
});

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

      // UI 업데이트 완료 후 버튼 표시
      if (headerButtons) {
        headerButtons.classList.remove("hidden");
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
              "Authorization": token,
              "Content-Type": "application/json"
          },
          withCredentials: true
      });

      sessionStorage.removeItem("Authorization");
      sessionStorage.removeItem("username");

      alert("로그아웃 되었습니다.");
      location.reload(); // 로그아웃 후 새로고침하여 UI 업데이트
  } catch (error) {
      console.error("로그아웃 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
  }
}
