const API_KEY = "a7ff72154d9967465a1fe5f7274997c4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKEND_URL = "http://localhost:8080"; // 백엔드 서버 주소

// 현재 예매 정보를 저장할 객체
const bookingInfo = {
    movieId: null,
    movieTitle: null,
    moviePoster: null,
    theater: null,
    date: null,
    time: null,
    seats: []
};

// FullCalendar 날짜 포맷 변환 함수
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 자동 스크롤 기능
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth", block: "start" });
}

// URL에서 movieId 가져오기
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");  // 'id' 값 추출
}

// 영화 정보 가져오기
async function fetchMovieDetail(movieId) {
    if (!movieId) {
        document.getElementById("movie-title").textContent = "영화 정보를 찾을 수 없습니다.";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`);
        const movie = await response.json();

        bookingInfo.movieId = movieId;
        bookingInfo.movieTitle = movie.title;
        bookingInfo.moviePoster = movie.poster_path;

        document.getElementById("movie-title").textContent = `${movie.title} 예매`;
        document.getElementById("movie-info-poster").innerHTML = `
        <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" class="img-fluid rounded" style="width: 200px;">
      `;
    
      document.getElementById("movie-info-text").innerHTML = `
        <div>
          <p class="card-text">개봉일: ${movie.release_date}</p>
          <p class="card-text">평점: ${movie.vote_average} / 10</p>
        </div>
      `;

      document.getElementById("summary-movie").textContent = movie.title;

    } catch (error) {
        console.error("영화 정보를 가져오는 중 오류 발생:", error);
    }
}

// 극장 선택 이벤트
function setupTheaterButtons() {
    document.querySelectorAll('.theater-btn').forEach(button => {
        button.addEventListener('click', async function() {
            document.querySelectorAll('.theater-btn').forEach(btn => btn.classList.remove('btn-light'));
            this.classList.add('btn-light');
            
            bookingInfo.theater = this.dataset.theater;
            document.getElementById("summary-theater").textContent = bookingInfo.theater;
            
            document.getElementById('step2').style.display = 'block';
            scrollToSection('step2');
            initCalendar();
        });
    });
}

// FullCalendar 초기화
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';  // 기존 캘린더 초기화

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridWeek',
        selectable: true,
        locale: 'ko',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'dayGridWeek'
        },
        validRange: {
            start: new Date()
        },
        select: function(info) {
            bookingInfo.date = info.startStr;
            document.getElementById("summary-date").textContent = formatDate(info.startStr);

            document.getElementById('step3').style.display = 'block';
            scrollToSection('step3');
            setupTimeSlots();
        }
    });

    calendar.render();
}

// 상영 시간표 가져오기 (임시 데이터)
async function fetchTimeSlots(theater, date) {
    return ["10:30", "13:00", "15:30", "18:00", "20:30", "23:00"];
}

// 상영 시간 선택
async function setupTimeSlots() {
    const timeSlotContainer = document.getElementById('time-slots');
    timeSlotContainer.innerHTML = '';

    const timeSlots = await fetchTimeSlots(bookingInfo.theater, bookingInfo.date);

    timeSlots.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.dataset.time = time;

        slot.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');

            bookingInfo.time = this.dataset.time;
            document.getElementById("summary-time").textContent = bookingInfo.time;

            document.getElementById('step4').style.display = 'block';
            scrollToSection('step4');
            generateSeats();
        });

        timeSlotContainer.appendChild(slot);
    });
}

// 예매된 좌석 가져오기
async function fetchSeats(theater, date, time) {
    // 백엔드에서 이미 예매된 좌석 정보를 가져오는 로직
    // 필요시 백엔드 API를 추가로 개발해야 함
    try {
        const scheduleTime = `${date} ${time}`;
        const response = await fetch(`${BACKEND_URL}/bookedSeats?theaterName=${encodeURIComponent(theater)}&scheduleTime=${encodeURIComponent(scheduleTime)}`);
        if (!response.ok) {
            return []; // 오류 발생 시 빈 배열 반환
        }
        const bookedSeats = await response.json();
        return bookedSeats; // 예매된 좌석 배열 반환
    } catch (error) {
        console.error("예매된 좌석 정보를 가져오는 중 오류 발생:", error);
        return [];
    }
}

// 좌석 생성
async function generateSeats() {
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = '';

    const bookedSeats = await fetchSeats(bookingInfo.theater, bookingInfo.date, bookingInfo.time);

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = 10;

    for (let col = 1; col <= cols; col++) { // 열을 기준으로 반복
        const colDiv = document.createElement('div');
        colDiv.className = 'seat-col';

        rows.forEach(row => { // 행을 기준으로 반복
            const seatNumber = `${row}${col}`; // 좌석 번호 생성
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.textContent = seatNumber;
            seat.dataset.seat = seatNumber;

            if (bookedSeats.includes(seatNumber)) {
                seat.classList.add('occupied');
            } else {
                seat.addEventListener('click', function () {
                    this.classList.toggle('selected');
                    updateSelectedSeats();
                });
            }

            colDiv.appendChild(seat);
        });

        seatsContainer.appendChild(colDiv);
    }

    document.getElementById('booking-summary').style.display = 'block';
}

// 선택한 좌석 업데이트
function updateSelectedSeats() {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    bookingInfo.seats = Array.from(selectedSeats).map(seat => seat.dataset.seat);

    document.getElementById('summary-seats').textContent = bookingInfo.seats.join(', ') || '선택된 좌석 없음';
}

// 예매 확정 (백엔드에 예약 요청)
function setupConfirmButton() {
    document.getElementById('confirm-booking').addEventListener('click', async function () {
        if (bookingInfo.seats.length === 0) {
            alert('좌석을 선택해주세요.');
            return;
        }

        // 백엔드에 맞춰 데이터 구조 수정
        const scheduleTime = `${bookingInfo.date} ${bookingInfo.time}`;

        try {
            // 각 좌석마다 별도의 예약 요청 대신 하나의 요청으로 수정
            const reservation = {
                movieTitle: bookingInfo.movieTitle,
                theaterName: bookingInfo.theater,
                scheduleTime: scheduleTime,
                seatNumber: bookingInfo.seats[0] // 첫 번째 좌석만 예약 
            };

            const response = await fetch(`${BACKEND_URL}/reservation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reservation),
                credentials: "include" // 쿠키 포함하여 요청 (세션 기반 인증을 위해)
            });

            const result = await response.json();

            if (result.msg === "이선좌") {
                alert("이미 예약된 좌석입니다.");
            } else if (result.msg === "예매 성공") {
                alert("예매가 완료되었습니다.");
                window.location.href = "index.html";
            } else {
                alert(result.msg || "예매 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("예매 요청 중 오류 발생:", error);
            alert("예매 중 오류가 발생했습니다.");
        }
    });
}

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', function() {
    const movieId = getMovieIdFromUrl();  // URL에서 movieId 가져오기
    fetchMovieDetail(movieId);  // 영화 정보 가져오기
    setupTheaterButtons();
    setupConfirmButton();
});