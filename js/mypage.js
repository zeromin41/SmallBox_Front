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

function displayReservations(reservations) {
  const container = document.getElementById("reservation-list");
  container.innerHTML = "";

  reservations.forEach((reservation) => {
    const div = document.createElement("div");
    div.classList.add("reservation-card");

    const seatNumbersText =
      reservation.seatNumbers && reservation.seatNumbers.length > 0
        ? reservation.seatNumbers.join(", ")
        : "좌석 정보 없음";

        let imageSrc = "이미지 경로 없음"; //  기본 이미지
    if (reservation.poster_path) {
      imageSrc = `${IMAGE_BASE_URL}${reservation.poster_path}`;
    }

    div.innerHTML = `
          <img src="${imageSrc}" alt="${reservation.movieTitle}" style="width: 100px; height: auto;">
          <p><strong>영화:</strong> ${reservation.movieTitle}</p>
          <p><strong>극장:</strong> ${reservation.theaterName}</p>
          <p><strong>상영시간:</strong> ${reservation.scheduleTime}</p>
          <p><strong>좌석:</strong> ${seatNumbersText}</p>
        `;
    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", fetchReservations);