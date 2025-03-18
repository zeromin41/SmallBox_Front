const API_KEY = "a7ff72154d9967465a1fe5f7274997c4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

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

// 영화 카드 UI 렌더링
function displayMovies(movies) {
    movieList.innerHTML = ""; // 기존 목록 초기화
    movies.forEach((movie, index) => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("card", "me-3","bg-purple");
        movieCard.style.flex = "0 0 calc(25% - 10px)";
        movieCard.style.minWidth = "calc(25% - 10px)";
        
        movieCard.innerHTML = `
        <div class="movie-container">
            <span class="ranking-badge">${index + 1}</span>
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" class="card-img-top movie-img" alt="${movie.title}">
            <div class="movie-overlay">
                <p class="movie-overview">${movie.overview}</p>
            </div>
        </div>
        <div class="card-body bg-dark">
            <h5 class="card-title text-white">${movie.title}</h5>
            <p class="card-text text-white">좋아요: ${movie.vote_count}</p>
        </div>
        <div class="card-footer bg-dark">
        <a href="booking.html?id=${movie.id}" class="btn btn-secondary booking-btn">예매</a>
        </div>`;
        
        movieList.appendChild(movieCard);
        
       
        movieCard.querySelector(".movie-container").addEventListener("click", () => {
            window.location.href = `movie_detail.html?id=${movie.id}`;
        });
        
        const overlay = movieCard.querySelector(".movie-overlay");
        movieCard.addEventListener("mouseenter", () => overlay.style.opacity = "1");
        movieCard.addEventListener("mouseleave", () => overlay.style.opacity = "0");
    });
}
fetchKoreanMovies();
