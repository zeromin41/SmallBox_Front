import { API_KEY, BASE_URL, IMAGE_BASE_URL } from "./config.js";

const movieList = document.getElementById("movie-list");
const banners = ["./img/banner1.jpg", "./img/banner2.jpg", "./img/banner3.jpg"];
let currentBanner = 0;

// 이벤트 배너 변경 함수
function changeBanner() {
  currentBanner = (currentBanner + 1) % banners.length;
  document.getElementById("banner-img").src = banners[currentBanner];
}
setInterval(changeBanner, 5000); // 5초마다 변경

// 한국 박스오피스 영화 가져오기
async function fetchKoreanMovies() {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&region=KR`
    );
    const data = await response.json();
    displayMovies(data.results.slice(0, 10)); // 상위 10개만 표시
  } catch (error) {
    console.error(" 한국 박스오피스 목록을 가져오는 중 오류 발생:", error);
  }
}

// 스크롤 버튼 기능 추가
document.addEventListener("DOMContentLoaded", function () {
  const scrollLeftBtn = document.getElementById("scroll-left");
  const scrollRightBtn = document.getElementById("scroll-right");

  if (scrollLeftBtn && scrollRightBtn && movieList) {
    scrollLeftBtn.addEventListener("click", () => {
      movieList.scrollBy({
        left: -movieList.clientWidth / 4,
        behavior: "smooth",
      });
    });

    scrollRightBtn.addEventListener("click", () => {
      movieList.scrollBy({
        left: movieList.clientWidth / 4,
        behavior: "smooth",
      });
    });
  }
});

// 영화 카드 UI 렌더링
function displayMovies(movies) {
  movieList.innerHTML = ""; // 기존 목록 초기화
  movies.forEach((movie, index) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("card", "me-3", "bg-purple");
    movieCard.style.flex = "0 0 calc(25% - 10px)";
    movieCard.style.minWidth = "calc(25% - 10px)";

    movieCard.innerHTML = `
            <div class="movie-container">
                <span class="ranking-badge">${index + 1}</span>
                <img src="${IMAGE_BASE_URL}${
      movie.poster_path
    }" class="card-img-top movie-img" alt="${movie.title}">
                          <div class="movie-overlay">
                              <p class="movie-overview">${movie.overview}</p>
                          </div>
                          <span class="like-count">👍 ${movie.vote_count}</span>
                      </div>
                      <div class="card-body" style="background-color:#a893a8; display: flex; justify-content: space-between; align-items: flex-end; ">
                      <h5 class="card-title text-white fs-6 fw-bolder" style="flex-grow: 1; /* 제목이 가로 공간을 차지하도록 설정 */
            white-space: nowrap; /* 한 줄로 표시 */
            overflow: hidden; /* 넘치는 내용 숨김 */
            text-overflow: ellipsis; /* 넘칠 경우 '...' 표시 */">${
              movie.title
            }</h5>
                      <button class="btn btn-pink text-white movie-booking-btn" style="background-color: pink; margin-right: 2px; margin-bottom: 5px; white-space: nowrap;">
                          예매
            </button>
        </div>

        `;

    movieList.appendChild(movieCard);

    const bookingBtn = movieCard.querySelector(".movie-booking-btn");
    if (bookingBtn) {
      bookingBtn.addEventListener("click", async function (event) {
        event.preventDefault();
        await checkLoginBeforeRedirect(event, `booking.html?id=${movie.id}`);
      });
    }

    const movieContainer = movieCard.querySelector(".movie-container");
    if (movieContainer) {
      movieContainer.addEventListener("click", () => {
        window.location.href = `movie_detail.html?id=${movie.id}`;
      });
    }

    // 무비 컨테이너에만 오버레이 적용
    const overlay = movieContainer.querySelector(".movie-overlay");
    movieContainer.addEventListener(
      "mouseenter",
      () => (overlay.style.opacity = "1")
    );
    movieContainer.addEventListener(
      "mouseleave",
      () => (overlay.style.opacity = "0")
    );
  });
}

fetchKoreanMovies();
