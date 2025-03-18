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

// 단일 좌석 예약 가능 여부 확인
async function checkSeatAvailability(theater, scheduleTime, seatNumber) {
  try {
    const reservationData = {
      movieTitle: bookingInfo.movieTitle,
      theaterName: theater,
      scheduleTime: scheduleTime,
      seatNumber: seatNumber,
    };

    // 세션 스토리지에서 토큰 직접 가져오기
    const token = sessionStorage.getItem('Authorization');
    console.log("Token in checkSeatAvailability:", token);

    const response = await fetch(`${BACKEND_URL}/reservation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": token // 토큰 사용
      },
      body: JSON.stringify(reservationData),
      credentials: "include"
    });

    const result = await response.json();
    return result.msg !== '이선좌';

  } catch (error) {
    console.error('좌석 예약 가능 여부 확인 중 오류:', error);
    return false;
  }
}

// 좌석 생성
async function generateSeats() {
  const seatsContainer = document.getElementById('seats-container');
  seatsContainer.innerHTML = '';
  bookingInfo.seats = [];

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = 10;
  const scheduleTime = `${bookingInfo.date} ${bookingInfo.time}`;

  for (let col = 1; col <= cols; col++) {
    const colDiv = document.createElement('div');
    colDiv.className = 'seat-col';

    for (let row of rows) {
      const seatNumber = `${row}${col}`;
      const seat = document.createElement('div');
      seat.className = 'seat';
      seat.textContent = seatNumber;
      seat.dataset.seat = seatNumber;

      const isAvailable = await checkSeatAvailability(bookingInfo.theater, scheduleTime, seatNumber);

      if (!isAvailable) {
        seat.classList.add('occupied');
      } else {
        seat.addEventListener('click', function () {
          this.classList.toggle('selected');
          updateSelectedSeats();
        });
      }
      colDiv.appendChild(seat);
    }
    seatsContainer.appendChild(colDiv);
  }
  document.getElementById('booking-summary').style.display = 'block';
}

function updateSelectedSeats() {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    bookingInfo.seats = Array.from(selectedSeats).map(seat => seat.dataset.seat);
    document.getElementById('summary-seats').textContent = bookingInfo.seats.length > 0
        ? bookingInfo.seats.join(', ')
        : '선택된 좌석 없음';
}

// 예매 확정 함수 (단일 좌석 예약으로 복원)
async function setupConfirmButton() {
  document.getElementById('confirm-booking').addEventListener('click', async function () {
      if (bookingInfo.seats.length !== 1) { // 단일 좌석만 선택되었는지 확인
          alert('좌석을 하나만 선택해주세요.');
          return;
      }

      try {
          const scheduleTime = `${bookingInfo.date} ${bookingInfo.time}`;
          const reservationData = {
              movieTitle: bookingInfo.movieTitle,
              theaterName: bookingInfo.theater,
              scheduleTime: scheduleTime,
              seatNumber: bookingInfo.seats[0] // 단일 좌석 번호
          };

           console.log("reservationData:", reservationData); // 요청 데이터 확인

          const token = sessionStorage.getItem('Authorization');


          const response = await fetch(`${BACKEND_URL}/reservation`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  "Authorization": token
              },
              body: JSON.stringify(reservationData),
              credentials: "include"
          });

          const result = await response.json();

          if (result.msg === '예매 성공') {
              alert('예매가 완료되었습니다.');
              window.location.href = 'index.html';
          } else {
              alert(`예매 실패: ${result.msg}`);
          }
      } catch (error) {
          console.error('예매 요청 중 오류 발생:', error);
          alert('예매 중 오류가 발생했습니다.');
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