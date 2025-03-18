const BACKEND_URL = "http://localhost:8080"; // 영민님처럼 변수로 저장해보기

async function fetchReservations() {
    const token = sessionStorage.getItem("Authorization"); // 로그인 토큰 가져오기
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
                "Authorization": token
            },
            credentials: "include"
        });

        const data = await response.json();

        console.log("서버 응답:", data); // fdafaf

        if (data.reservations) {
            displayReservations(data.reservations);
        } else {
            document.getElementById("reservation-list").innerHTML = "<p class='text-white text-center'>예매 내역이 없습니다.</p>";
        }
    } catch (error) {
        console.error("예매 내역 조회 중 오류 발생:", error);
    }
}

function displayReservations(reservations) {
    const container = document.getElementById("reservation-list");
    container.innerHTML = "";

    reservations.forEach(reservation => {
        console.log("예약 좌석 정보:", reservation.seatNumbers);

        const div = document.createElement("div");
        div.classList.add("reservation-card");

        // 좌석 정보가 존재하면 join, 없으면 "좌석 정보 없음" 표시
        const seatNumbersText = reservation.seatNumbers && reservation.seatNumbers.length > 0
        ? reservation.seatNumbers.join(", ")
        : "좌석 정보 없음";
    
    console.log("예약 좌석 정보:", reservation.seatNumbers); // 디버깅용 출력

        div.innerHTML = `
            <p><strong>영화:</strong> ${reservation.movieTitle}</p>
            <p><strong>극장:</strong> ${reservation.theaterName}</p>
            <p><strong>상영시간:</strong> ${reservation.scheduleTime}</p>
            <p><strong>좌석:</strong> ${seatNumbersText}</p>
        `;
        container.appendChild(div);
    });
}



document.addEventListener("DOMContentLoaded", fetchReservations);
