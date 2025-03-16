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
    seats: [],
    totalPrice: 0
};

// 로컬 스토리지에서 이미 예매된 좌석 데이터를 관리하는 기능
function getBookedSeats(theater, date, time) {
    const key = `booked-${theater}-${date}-${time}`;
    const bookedSeats = localStorage.getItem(key);
    return bookedSeats ? JSON.parse(bookedSeats) : [];
}

function saveBookedSeats(theater, date, time, seats) {
    const key = `booked-${theater}-${date}-${time}`;
    const bookedSeats = getBookedSeats(theater, date, time);
    const updatedBookedSeats = [...new Set([...bookedSeats, ...seats])];
    localStorage.setItem(key, JSON.stringify(updatedBookedSeats));
}

// URL에서 영화 ID 가져오기
function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// 영화 상세 정보 가져오기
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
        
        // 영화 제목 설정
        document.getElementById("movie-title").textContent = `"${movie.title}" 예매`;
        bookingInfo.movieTitle = movie.title;
        bookingInfo.moviePoster = movie.poster_path;
        
        // 영화 정보 표시
        const movieInfoElement = document.getElementById("movie-info");
        movieInfoElement.innerHTML = `
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" 
                style="width: 100px; border-radius: 5px; margin-right: 20px;">
            <div>
                <h5>${movie.title}</h5>
                <p>개봉일: ${movie.release_date}</p>
                <p>평점: ${movie.vote_average} / 10</p>
            </div>
        `;
        
        // 예매 요약 영화 이름 설정
        document.getElementById("summary-movie").textContent = movie.title;
        
    } catch (error) {
        console.error("영화 정보를 가져오는 중 오류 발생:", error);
        document.getElementById("movie-title").textContent = "영화 정보를 불러오는 데 실패했습니다.";
    }
}

// 첫번째로 극장 선택 버튼 이벤트 설정
function setupTheaterButtons() {
    const theaterButtons = document.querySelectorAll('.theater-btn');
    theaterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 선택된 버튼 스타일 변경
            theaterButtons.forEach(btn => btn.classList.remove('btn-light'));
            theaterButtons.forEach(btn => btn.classList.add('btn-outline-light'));
            button.classList.remove('btn-outline-light');
            button.classList.add('btn-light');
            
            // 극장 정보 저장
            bookingInfo.theater = button.dataset.theater;
            document.getElementById("summary-theater").textContent = bookingInfo.theater;
            
            // 다음 단계로 이동
            document.getElementById('step2').style.display = 'block';
            initCalendar();
        });
    });
}

// 두번째 단계로 캘린더 초기화
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    // FullCalendar 인스턴스 생성
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        selectMirror: true,
        unselectAuto: false,
        locale: 'ko',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        validRange: {
            start: new Date()
        },
        select: function(info) {
            // 선택한 날짜 정보 저장
            const selectedDate = info.startStr;
            bookingInfo.date = selectedDate;
            document.getElementById("summary-date").textContent = formatDate(selectedDate);
            
            // 다음 단계로 이동
            document.getElementById('step3').style.display = 'block';
            setupTimeSlots();
        }
    });
    
    calendar.render();
}

// 날짜 포맷 변경(YYYY-MM-DD -> YYYY년 MM월 DD일)
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일`;
}

// 시간 슬롯 설정
function setupTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            // 선택된 시간 슬롯 스타일 변경
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            
            // 시간 정보 저장
            bookingInfo.time = slot.dataset.time;
            document.getElementById("summary-time").textContent = bookingInfo.time;
            
            // 다음 단계로 이동
            document.getElementById('step4').style.display = 'block';
            generateSeats();
        });
    });
}

// 좌석 생성
function generateSeats() {
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = '';
    
    // 이미 예매된 좌석 가져오기
    const bookedSeats = getBookedSeats(bookingInfo.theater, bookingInfo.date, bookingInfo.time);
    
    // 좌석 행과 열 설정 (8행 10열)
    const rows = 8;
    const cols = 10;
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        // 행 라벨 추가
        const rowLabel = document.createElement('span');
        rowLabel.textContent = rowLabels[i];
        rowLabel.style.display = 'inline-block';
        rowLabel.style.width = '20px';
        rowLabel.style.marginRight = '10px';
        rowLabel.style.textAlign = 'center';
        rowDiv.appendChild(rowLabel);
        
        for (let j = 0; j < cols; j++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            const seatNumber = `${rowLabels[i]}${j+1}`;
            seat.textContent = j + 1;
            seat.dataset.seat = seatNumber;
            
            // 이미 예매된 좌석인지 확인
            if (bookedSeats.includes(seatNumber)) {
                seat.classList.add('occupied');
            } else {
                // 선택 가능한 좌석에 클릭 이벤트 추가
                seat.addEventListener('click', function() {
                    if (!seat.classList.contains('occupied')) {
                        seat.classList.toggle('selected');
                        
                        // 좌석 정보 업데이트
                        updateSelectedSeats();
                    }
                });
            }
            
            rowDiv.appendChild(seat);
        }
        
        seatsContainer.appendChild(rowDiv);
    }
    
    // 예매 요약 표시
    document.getElementById('booking-summary').style.display = 'block';
}

// 선택된 좌석 정보 업데이트
function updateSelectedSeats() {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    const seatNumbers = Array.from(selectedSeats).map(seat => seat.dataset.seat);
    
    bookingInfo.seats = seatNumbers;
    
    // 가격 계산 (1좌석당 12,000원)
    const price = seatNumbers.length * 12000;
    bookingInfo.totalPrice = price;
    
    // 좌석 정보 및 가격 업데이트
    document.getElementById('summary-seats').textContent = seatNumbers.join(', ') || '선택된 좌석 없음';
    document.getElementById('summary-price').textContent = price.toLocaleString() + '원';
}

// 예매 확정 버튼 설정
function setupConfirmButton() {
    const confirmButton = document.getElementById('confirm-booking');
    confirmButton.addEventListener('click', function() {
        // 좌석이 선택되었는지 확인
        if (bookingInfo.seats.length === 0) {
            alert('좌석을 선택해주세요.');
            return;
        }
        
        // 예매 정보 저장
        saveBookedSeats(bookingInfo.theater, bookingInfo.date, bookingInfo.time, bookingInfo.seats);
        
        // 예매 완료 메시지 표시
        alert('예매가 완료되었습니다.\n' + 
              '영화: ' + bookingInfo.movieTitle + '\n' +
              '극장: ' + bookingInfo.theater + '\n' +
              '날짜: ' + formatDate(bookingInfo.date) + '\n' +
              '시간: ' + bookingInfo.time + '\n' +
              '좌석: ' + bookingInfo.seats.join(', ') + '\n' +
              '가격: ' + bookingInfo.totalPrice.toLocaleString() + '원');
        
        // 홈페이지로 이동
        window.location.href = 'index.html';
    });
}

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', function() {
    fetchMovieDetail();
    setupTheaterButtons();
    setupConfirmButton();
});