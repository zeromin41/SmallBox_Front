const BACKEND_URL = "http://localhost:8080";
import { API_KEY, BASE_URL, IMAGE_BASE_URL } from "./config.js";

async function fetchReservations() {
  const token = sessionStorage.getItem("Authorization");
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/myReservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      credentials: "include",
    });

    const data = await response.json();
    console.log("서버 응답:", data);

    if (data.reservations) {
      // movieId를 사용하여 포스터 정보를 가져오는 로직 추가
      const reservationsWithPoster = await Promise.all(
        data.reservations.map(async (reservation) => {
          const posterPath = await fetchPosterPath(reservation.movieId); // movieId 사용
          return { ...reservation, poster_path: posterPath };
        })
      );
      displayReservations(reservationsWithPoster);
    } else {
      document.getElementById("reservation-list").innerHTML =
        "<p class='text-white text-center'>예매 내역이 없습니다.</p>";
    }
  } catch (error) {
    console.error("예매 내역 조회 중 오류 발생:", error);
  }
}

// TMDB에서 영화 포스터 경로 가져오기 (movieId 사용)
async function fetchPosterPath(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.poster_path) {
      return data.poster_path; // 영화 정보에 poster_path가 있으면 반환
    } else {
      return null; // 포스터를 찾을 수 없음
    }
  } catch (error) {
    console.error("포스터 경로 가져오기 오류:", error);
    return null;
  }
}

// 버튼 추가를 위해 displayReservations 함수 수정
function displayReservations(reservations) {
  const container = document.getElementById("reservation-list");
  container.innerHTML = "";

  reservations.forEach((reservation) => {
    // 전체 카드 컨테이너
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("reservation-card");

    // 티켓 이미지 배경 설정 - 고정 크기로 변경
    cardDiv.style.backgroundImage = "url('./img/ticket.png')";
    cardDiv.style.backgroundSize = "contain";
    cardDiv.style.backgroundRepeat = "no-repeat";
    cardDiv.style.backgroundPosition = "center";
    cardDiv.style.width = "700px"; // 고정 너비 설정
    cardDiv.style.height = "270px"; // 고정 높이 설정
    cardDiv.style.position = "relative"; // 내부 요소를 절대 위치로 배치하기 위함
    cardDiv.style.margin = "20px auto"; // 가운데 정렬

    // 이미지 요소 생성 - 고정 위치 설정
    const img = document.createElement("img");
    img.src = reservation.poster_path
      ? `${IMAGE_BASE_URL}${reservation.poster_path}`
      : "default-image.jpg";
    img.alt = reservation.movieTitle;
    img.classList.add("reservation-poster");
    img.style.width = "100px"; // 고정 너비
    img.style.height = "150px"; // 고정 높이
    img.style.borderRadius = "8px";
    img.style.position = "absolute"; // 절대 위치
    img.style.left = "80px"; // 왼쪽에서
    img.style.top = "50px"; // 위에서

    // 영화 정보 컨테이너 - 고정 위치 설정
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("reservation-info");
    infoDiv.style.position = "absolute"; // 절대 위치
    infoDiv.style.left = "250px"; // 왼쪽에서 160px
    infoDiv.style.top = "50px"; // 위에서 25px
    infoDiv.style.width = "280px"; // 고정 너비
    infoDiv.style.height = "150px"; // 고정 높이
    infoDiv.style.display = "flex";
    infoDiv.style.flexDirection = "column";
    infoDiv.style.justifyContent = "space-between";

    // 영화 정보 요소 추가 - 고정 크기 글꼴
    const title = document.createElement("p");
    title.innerHTML = `<strong>영화:</strong> ${reservation.movieTitle}`;

    const theater = document.createElement("p");
    theater.innerHTML = `<strong>극장:</strong> ${reservation.theaterName}`;

    const schedule = document.createElement("p");
    schedule.innerHTML = `<strong>상영시간:</strong> ${reservation.scheduleTime}`;

    const seatNumbers = document.createElement("p");
    seatNumbers.innerHTML = `<strong>좌석:</strong> ${
      reservation.seatNumbers?.join(", ") || "좌석 정보 없음"
    }`;

    // 영화 정보 div에 추가
    infoDiv.appendChild(title);
    infoDiv.appendChild(theater);
    infoDiv.appendChild(schedule);
    infoDiv.appendChild(seatNumbers);

    // 취소 버튼 추가 - 고정 위치 설정
    const cancelBtn = document.createElement("button");
    cancelBtn.classList.add("btn", "cancel-btn");
    cancelBtn.onclick = () => showCancelConfirmation(reservation.reservationId);
    // 휴지통 아이콘 추가
    const trashIcon = document.createElement("i");
    trashIcon.classList.add("bi", "bi-trash-fill"); // bootstrap icon 사용

    // 버튼에 아이콘과 텍스트 추가
    cancelBtn.appendChild(trashIcon);

    // 카드에 요소들 추가
    cardDiv.appendChild(img);
    cardDiv.appendChild(infoDiv);
    cardDiv.appendChild(cancelBtn);

    // 전체 리스트에 추가
    container.appendChild(cardDiv);
  });
}
// 취소 확인 모달 표시
function showCancelConfirmation(reservationId) {
  // 모달 생성
  const modal = document.createElement("div");
  modal.classList.add("cancel-modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const message = document.createElement("p");
  message.textContent = "정말 예약을 취소하시겠습니까?";

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("modal-btn-container");

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "확인";
  confirmBtn.classList.add("btn", "btn-pink", "confirm-btn");
  confirmBtn.onclick = () => cancelReservation(reservationId, modal);

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "취소";
  cancelBtn.classList.add("btn", "btn-secondary", "modal-cancel-btn");
  cancelBtn.onclick = () => document.body.removeChild(modal);

  btnContainer.appendChild(confirmBtn);
  btnContainer.appendChild(cancelBtn);

  modalContent.appendChild(message);
  modalContent.appendChild(btnContainer);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

// 예약 취소 API 호출
async function cancelReservation(reservationId, modal) {
  const token = sessionStorage.getItem("Authorization");
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/cancelReservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ reservationId }),
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      alert("예약이 취소되었습니다.");
      // 모달 제거
      document.body.removeChild(modal);
      // 예약 목록 다시 불러오기
      fetchReservations();
    } else {
      alert("예약 취소에 실패했습니다: " + data.message);
    }
  } catch (error) {
    console.error("예약 취소 중 오류 발생:", error);
    alert("예약 취소 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", fetchReservations);
