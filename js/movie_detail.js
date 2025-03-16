const API_KEY = "a7ff72154d9967465a1fe5f7274997c4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const movieDetailContainer = document.getElementById("movie-detail");

// URL에서 영화 ID 가져오기
function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// 영화 상세 정보 가져오기
async function fetchMovieDetail() {
    const movieId = getMovieIdFromUrl();    //url에서 가져온 id 변수로 추가가
    if (!movieId) {
        movieDetailContainer.innerHTML = "<p>영화를 찾을 수 없습니다.</p>";
        return;
    }

    //movieid있을때,
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`);
        const movie = await response.json();
        displayMovieDetail(movie);
    } catch (error) {
        console.error("영화 정보를 가져오는 중 오류 발생:", error);
        movieDetailContainer.innerHTML = "<p>영화 정보를 불러오는 데 실패했습니다.</p>";
    }
}

// 영화 상세 정보 UI 표시 (이미지 왼쪽 + 정보 오른쪽)
function displayMovieDetail(movie) {
    movieDetailContainer.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" 
             style="max-width: 1000px; gap: 30px; margin: auto; padding: 20px; background-color: rgb(53, 2, 53);">
            
            <!-- 영화 포스터 -->
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" 
                 style="width: 300px; object-fit: cover; border-radius: 10px;">

            <!-- 영화 정보 -->
            <div class="text-white">
                <h2>${movie.title}</h2>
                <p><strong>개봉일:</strong> ${movie.release_date}</p>
                <p><strong>평점:</strong> ${movie.vote_average} / 10</p>
                <p><strong>줄거리:</strong> ${movie.overview}</p>
                <a href="booking.html?id=${movie.id}" class="btn btn-secondary">예매</a>
            </div>
        </div>
    `;
}

// 상세 정보 가져오기 실행
fetchMovieDetail();
