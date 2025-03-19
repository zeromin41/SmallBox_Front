const BACKEND_URL = "http://localhost:8080";
const API_KEY = "a7ff72154d9967465a1fe5f7274997c4"; // moviedetail.js에서 가져옴
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // moviedetail.js에서 가져옴

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
                const posterPath = await fetchPosterPath(reservation.movieId);  // movieId 사용
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
      
      // 이미지 요소 생성
      const img = document.createElement("img");
      img.src = reservation.poster_path
        ? `${IMAGE_BASE_URL}${reservation.poster_path}`
        : "default-image.jpg"; // 기본 이미지 설정 가능
      img.alt = reservation.movieTitle;
      img.classList.add("reservation-poster");
      
      // 영화 정보 컨테이너 (세로 정렬)
      const infoDiv = document.createElement("div");
      infoDiv.classList.add("reservation-info");
      
      // 영화 정보 요소 추가
      const title = document.createElement("p");
      title.innerHTML = `<strong>영화:</strong> ${reservation.movieTitle}`;
      
      const theater = document.createElement("p");
      theater.innerHTML = `<strong>극장:</strong> ${reservation.theaterName}`;
      
      const schedule = document.createElement("p");
      schedule.innerHTML = `<strong>상영시간:</strong> ${reservation.scheduleTime}`;
      
      const seatNumbers = document.createElement("p");
      seatNumbers.innerHTML = `<strong>좌석:</strong> ${reservation.seatNumbers?.join(", ") || "좌석 정보 없음"}`;
      
      // 영화 정보 div에 추가 (세로 배치)
      infoDiv.appendChild(title);
      infoDiv.appendChild(theater);
      infoDiv.appendChild(schedule);
      infoDiv.appendChild(seatNumbers);
      
      // 취소 버튼 추가
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "예약 취소";
      cancelBtn.classList.add("cancel-btn");
      cancelBtn.onclick = () => showCancelConfirmation(reservation.reservationId);
      
      // 버튼 컨테이너 (오른쪽 하단 정렬)
      const btnContainer = document.createElement("div");
      btnContainer.classList.add("btn-container");
      btnContainer.appendChild(cancelBtn);
      
      // 카드에 이미지와 정보 추가
      cardDiv.appendChild(img);
      cardDiv.appendChild(infoDiv);
      cardDiv.appendChild(btnContainer);
      
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
    confirmBtn.classList.add("confirm-btn");
    confirmBtn.onclick = () => cancelReservation(reservationId, modal);
    
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "취소";
    cancelBtn.classList.add("cancel-btn");
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