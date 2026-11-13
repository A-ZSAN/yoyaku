//==================================================
// 温泉予約システム
// 予約画面
//==================================================

let unitPrice = 0;
let people = 1;
let selectedDate = null;
let calendarData = [];
let currentMonth = new Date();

let minMonth = new Date();
minMonth.setDate(1);

let maxMonth = new Date();
maxMonth.setMonth(maxMonth.getMonth() + 2);
maxMonth.setDate(1);

//==================================================
// 初期処理
//==================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadPrices();           // 料金取得
  await loadCalendar();         // カレンダー取得
  restoreFormData();
  attachFormListeners();
  applyUrlParams();             // URLパラメータ反映

  // 人数ボタン
  document.getElementById("minusPeople").onclick = () => {
    if (people > 1) {
      people--;
      updatePeople();
    }
  };

  document.getElementById("plusPeople").onclick = () => {
    if (people < 20) {
      people++;
      updatePeople();
    }
  };

  document.getElementById("reserveButton").addEventListener("click", sendReservation);
});

//==================================================
// 料金取得
//==================================================
async function loadPrices() {
  try {
    const res = await fetch(API_URL + "/api/prices");
    if (!res.ok) throw new Error("通信エラー");

    const data = await res.json();
    if (data.length > 0) {
      unitPrice = Number(data[0].price);
    }
  } catch (error) {
    console.error("料金取得エラー:", error);
  }
}

//==================================================
// URLパラメータから日付・人数を反映
//==================================================
function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get("date");
  const peopleParam = params.get("people");

  if (peopleParam) {
    const num = parseInt(peopleParam);
    if (num >= 1 && num <= 20) {
      people = num;
      document.getElementById("people").value = num;
      document.getElementById("peopleDisplay").textContent = num;
      calculatePrice();
    }
  }

  if (dateParam) {
    setTimeout(() => {
      selectDateFromCalendar(dateParam);
    }, 600);
  }
}

//==================================================
// カレンダーから日付を選択
//==================================================
function selectDateFromCalendar(dateStr) {
  const buttons = document.querySelectorAll(".calendar-day.available, .calendar-day.few");

  buttons.forEach(btn => {
    const day = parseInt(btn.textContent, 10);
    const targetDay = new Date(dateStr).getDate();

    if (day === targetDay) {
      btn.click();
    }
  });
}

//==================================================
// カレンダー関連
//==================================================
async function loadCalendar() {
  try {
    const res = await fetch(API_URL + "/api/calendar");
    if (!res.ok) throw new Error("通信エラー");

    calendarData = await res.json();
    renderCalendar();

    document.getElementById("prevMonth").onclick = () => {
      if (currentMonth > minMonth) {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
      }
    };

    document.getElementById("nextMonth").onclick = () => {
      if (currentMonth < maxMonth) {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
      }
    };
  } catch (error) {
    console.error("カレンダー取得エラー:", error);
  }
}

function renderCalendar() {
  const area = document.getElementById("calendar");
  const title = document.getElementById("calendarTitle");

  area.innerHTML = "";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  title.textContent = `${year}年${month + 1}月`;

  document.getElementById("prevMonth").disabled = currentMonth <= minMonth;
  document.getElementById("nextMonth").disabled = currentMonth >= maxMonth;

  const week = ["日", "月", "火", "水", "木", "金", "土"];
  week.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    div.className = "calendar-week";
    area.appendChild(div);
  });

  const firstDay = new Date(year, month, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    area.appendChild(document.createElement("div"));
  }

  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayData = calendarData.find(x => x.date === dateStr);

    const button = document.createElement("button");
    button.textContent = d;
    button.type = "button";

    const targetDate = new Date(year, month, d);
    const isPast = targetDate < today;
    const isAvailable = dayData && dayData.available;

    if (isAvailable && !isPast) {
      button.className = "calendar-day available";

      if (dayData.remaining !== undefined && dayData.remaining <= 3) {
        button.className = "calendar-day few";
      }

      button.onclick = () => {
        selectedDate = dateStr;
        document.getElementById("useDate").value = dateStr;
        document.getElementById("selectedDateText").textContent = `利用日：${dateStr}`;

        document.querySelectorAll(".calendar-day").forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        saveFormData();
      };
    } else {
      button.className = "calendar-day disabled";
    }

    area.appendChild(button);
  }
}

//==================================================
// 人数制御
//==================================================
function updatePeople() {
  document.getElementById("peopleDisplay").textContent = people;
  document.getElementById("people").value = people;
  calculatePrice();
  saveFormData();
}

//==================================================
// 料金計算
//==================================================
function calculatePrice() {
  const peopleNum = parseInt(document.getElementById("people").value) || 0;
  const priceEl = document.getElementById("totalPrice");

  if (peopleNum === 0) {
    priceEl.textContent = "人数を選択してください";
    return;
  }

  const total = peopleNum * unitPrice;
  priceEl.textContent = `¥${total.toLocaleString()}（${peopleNum}名）`;
}

//==================================================
// フォーム自動保存・復元
//==================================================
function attachFormListeners() {
  const ids = ["company", "name", "phone", "mail", "memo", "people", "useDate"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", saveFormData);
      el.addEventListener("change", saveFormData);
    }
  });
}

function saveFormData() {
  const data = {
    company: document.getElementById("company").value,
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    mail: document.getElementById("mail").value,
    memo: document.getElementById("memo").value,
    people: document.getElementById("people").value,
    useDate: document.getElementById("useDate").value
  };
  localStorage.setItem("reservationFormData", JSON.stringify(data));
}

function restoreFormData() {
  const saved = localStorage.getItem("reservationFormData");
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    if (data.company) document.getElementById("company").value = data.company;
    if (data.name) document.getElementById("name").value = data.name;
    if (data.phone) document.getElementById("phone").value = data.phone;
    if (data.mail) document.getElementById("mail").value = data.mail;
    if (data.memo) document.getElementById("memo").value = data.memo;
    if (data.people) {
      document.getElementById("people").value = data.people;
      document.getElementById("peopleDisplay").textContent = data.people;
    }
    if (data.useDate) {
      document.getElementById("useDate").value = data.useDate;
      document.getElementById("selectedDateText").textContent = `利用日：${data.useDate}`;
    }
  } catch (e) {
    console.error("フォーム復元エラー", e);
  }
}

//==================================================
// 予約送信
//==================================================
async function sendReservation() {
  const reserveButton = document.getElementById("reserveButton");
  if (reserveButton.disabled) return;

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const date = document.getElementById("useDate").value;

  if (!date) {
    alert("利用日を選択してください");
    return;
  }
  if (!name || !phone) {
    alert("お名前と電話番号は必須です");
    return;
  }

  reserveButton.disabled = true;

  try {
    const body = {
      useDate: date,
      company: document.getElementById("company").value,
      name: name,
      phone: phone,
      mail: document.getElementById("mail").value,
      people: Number(document.getElementById("people").value),
      memo: document.getElementById("memo").value
    };

    const res = await fetch(API_URL + "/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("通信エラー");

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("reservationResult", JSON.stringify({
        reservationNo: data.reservationNo,
        useDate: date,
        people: body.people,
        totalPrice: data.totalPrice
      }));

      localStorage.removeItem("reservationFormData");
      location.href = "reservation-complete.html";
    } else {
      alert(data.message || "予約に失敗しました");
    }
  } catch (error) {
    console.error(error);
    alert("通信エラーが発生しました。");
  } finally {
    reserveButton.disabled = false;
  }
}
