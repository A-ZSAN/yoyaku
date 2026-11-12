//==================================================
// 温泉予約システム
// 予約画面（改善版）
//==================================================

let unitPrice = 0;
let people = 1;
let selectedDate = null;
let calendarData = [];
let currentMonth = new Date();

// 表示可能月範囲
let minMonth = new Date();
minMonth.setDate(1);

let maxMonth = new Date();
maxMonth.setMonth(maxMonth.getMonth() + 2);
maxMonth.setDate(1);

//==================================================
// 初期処理
//==================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadPrices();
  await loadCalendar();
  restoreFormData();
  attachFormListeners();

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
// カレンダー取得
//==================================================
async function loadCalendar() {
  try {
    const res = await fetch(API_URL + "/api/calendar");
    if (!res.ok) throw new Error("通信エラー");

    calendarData = await res.json();
    renderCalendar();

    // ボタン制御
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

//==================================================
// カレンダー表示
//==================================================
function renderCalendar() {
  const area = document.getElementById("calendar");
  const title = document.getElementById("calendarTitle");

  area.innerHTML = "";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  title.textContent = `${year}年${month + 1}月`;

  // ボタン無効化制御
  document.getElementById("prevMonth").disabled = currentMonth <= minMonth;
  document.getElementById("nextMonth").disabled = currentMonth >= maxMonth;

  // 曜日ヘッダー
  const week = ["日", "月", "火", "水", "木", "金", "土"];
  week.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    div.className = "calendar-week";
    area.appendChild(div);
  });

  // 空白セル
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
      button.className = "calendar-day";
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
// 人数更新
//==================================================
function updatePeople() {
  document.getElementById("peopleDisplay").textContent = people;
  document.getElementById("people").value = people;
  updatePrice();
  saveFormData();
}

//==================================================
// 金額表示
//==================================================
function updatePrice() {
  const peopleNum = Number(document.getElementById("people").value);
  const total = peopleNum * unitPrice;
  document.getElementById("totalPrice").textContent = `${total.toLocaleString()}円`;
}

//==================================================
// フォーム自動保存・復元
//==================================================
function attachFormListeners() {
  const ids = ["company", "name", "phone", "mail", "memo", "people"];
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
      people = parseInt(data.people);
      document.getElementById("people").value = people;
      document.getElementById("peopleDisplay").textContent = people;
    }
    if (data.useDate) {
      selectedDate = data.useDate;
      document.getElementById("useDate").value = data.useDate;
      document.getElementById("selectedDateText").textContent = `利用日：${data.useDate}`;
    }
    updatePrice();
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

  if (!selectedDate) {
    alert("利用日を選択してください");
    return;
  }
  if (!document.getElementById("name").value.trim()) {
    alert("お名前を入力してください");
    return;
  }
  if (!document.getElementById("phone").value.trim()) {
    alert("電話番号を入力してください");
    return;
  }

  reserveButton.disabled = true;

  try {
    const body = {
      useDate: selectedDate,
      company: document.getElementById("company").value,
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
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
        useDate: selectedDate,
        people: body.people,
        totalPrice: data.totalPrice
      }));

      // 入力内容をクリア
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