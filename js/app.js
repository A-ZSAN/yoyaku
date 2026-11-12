document.addEventListener("DOMContentLoaded", () => {
  loadSite();
  loadNews();
  loadPrices();
  setDefaultDate();
});

// 今日の日付を自動入力
function setDefaultDate() {
  const dateInput = document.getElementById("date");
  if (!dateInput) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${year}-${month}-${day}`;
  dateInput.min = `${year}-${month}-${day}`; // 過去日を選択不可にする
}

// 施設情報取得
async function loadSite() {
  try {
    const res = await fetch(API_URL + "/api/site");
    if (!res.ok) throw new Error("通信エラー");

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "データ取得に失敗しました");

    if (data.facilityName) {
      document.getElementById("facilityName").textContent = data.facilityName;
    }
    if (data.description) {
      document.getElementById("description").textContent = data.description;
    }

    const heroImage = document.getElementById("heroImage");
    if (data.image) {
      heroImage.src = data.image;
    } else {
      heroImage.style.display = "none";
    }

  } catch (error) {
    console.error("施設情報取得エラー:", error);
    document.getElementById("description").textContent = "施設情報の読み込みに失敗しました";
  }
}

// お知らせ取得（XSS対策済み）
async function loadNews() {
  const area = document.getElementById("news");

  try {
    const res = await fetch(API_URL + "/api/news");
    if (!res.ok) throw new Error("通信エラー");

    const data = await res.json();

    area.innerHTML = "";

    if (!data || !Array.isArray(data) || data.length === 0) {
      area.textContent = "現在お知らせはありません";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "news-item";

      const title = document.createElement("strong");
      title.textContent = item.title || "";

      const content = document.createElement("div");
      content.textContent = item.content || "";

      div.appendChild(title);
      div.appendChild(content);
      area.appendChild(div);
    });

  } catch (error) {
    console.error("お知らせ取得エラー:", error);
    area.textContent = "お知らせの読み込みに失敗しました";
  }
}

// 料金取得
async function loadPrices() {
  const area = document.getElementById("prices");

  try {
    const res = await fetch(API_URL + "/api/prices");
    if (!res.ok) throw new Error("通信エラー");

    const data = await res.json();

    area.innerHTML = "";

    if (!data || !Array.isArray(data) || data.length === 0) {
      area.textContent = "料金設定がありません";
      return;
    }

    data.forEach(price => {
      const div = document.createElement("div");
      div.className = "price-item";

      const name = price.name || "";
      const priceValue = Number(price.price || 0).toLocaleString();
      div.textContent = `${name}　${priceValue}円`;

      area.appendChild(div);
    });

  } catch (error) {
    console.error("料金取得エラー:", error);
    area.textContent = "料金情報の読み込みに失敗しました";
  }
}