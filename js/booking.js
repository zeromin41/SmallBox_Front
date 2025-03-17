const API_KEY = "a7ff72154d9967465a1fe5f7274997c4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

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

// 영화 정보 가져오기
async function fetchMovieDetail() {
    const movieId = getMovieIdFromUrl();
    if (!movieId) {
        document.getElementById("movie-title").textContent = "영화 정보를 찾을 수 없습니다.";
        return;
    }

    bookingInfo.movieId = movieId;

    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`);
        const movie = await response.json();
        
        document.getElementById("movie-title").textContent = `"${movie.title}" 예매`;
        bookingInfo.movieTitle = movie.title;
        bookingInfo.moviePoster = movie.poster_path;
        
        document.getElementById("movie-info").innerHTML = `
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" class="movie-poster">
            <div>
                <h5>${movie.title}</h5>
                <p>개봉일: ${movie.release_date}</p>
                <p>평점: ${movie.vote_average} / 10</p>
            </div>
        `;
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

// 예매된 좌석 가져오기 (임시 데이터)
async function fetchSeats(theater, date, time) {
    return ["A3", "A4", "B5"];
}

// 좌석 생성
async function generateSeats() {
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = '';

    const bookedSeats = await fetchSeats(bookingInfo.theater, bookingInfo.date, bookingInfo.time);
    
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = 10;
    
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';

        for (let i = 1; i <= cols; i++) {
            const seatNumber = `${row}${i}`;
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.textContent = `${row}${i}`;
            seat.dataset.seat = seatNumber;

            if (bookedSeats.includes(seatNumber)) {
                seat.classList.add('occupied');
            } else {
                seat.addEventListener('click', function() {
                    this.classList.toggle('selected');
                    updateSelectedSeats();
                });
            }

            rowDiv.appendChild(seat);
        }

        seatsContainer.appendChild(rowDiv);
    });

    document.getElementById('booking-summary').style.display = 'block';
}

// 선택한 좌석 업데이트
function updateSelectedSeats() {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    bookingInfo.seats = Array.from(selectedSeats).map(seat => seat.dataset.seat);

    document.getElementById('summary-seats').textContent = bookingInfo.seats.join(', ') || '선택된 좌석 없음';
}

// 예매 확정 버튼
function setupConfirmButton() {
    document.getElementById('confirm-booking').addEventListener('click', function() {
        if (bookingInfo.seats.length === 0) {
            alert('좌석을 선택해주세요.');
            return;
        }

        alert('예매가 완료되었습니다.');
        window.location.href = 'index.html';
    });
}

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', function() {
    fetchMovieDetail();
    setupTheaterButtons();
    setupConfirmButton();
});
