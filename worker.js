//==================================================
// 温泉予約システム
// Cloudflare Worker（修正版）
//==================================================

export default {
  async fetch(request, env) {
    // CORS対応
    if (request.method === "OPTIONS") {
      return cors();
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      //======================================
      // GETリクエスト
      //======================================
      if (method === "GET") {
        if (path === "/api/site") {
          return gasGet(env, "getSite");
        }
        if (path === "/api/news") {
          return gasGet(env, "getNews");
        }
        if (path === "/api/prices") {
          return gasGet(env, "getPrices");
        }
        if (path === "/api/calendar") {
          return gasGet(env, "getCalendar");
        }
        if (path === "/api/reservations") {
          return gasGet(env, "getReservations");
        }
        if (path === "/api/mypage") {
          const phone = url.searchParams.get("phone") || "";
          return gasGet(env, "getMypage", { phone });
        }
      }

      //======================================
      // POSTリクエスト（予約作成）
      //======================================
      if (path === "/api/reservation" && method === "POST") {
        return gasPost(request, env, "saveReservation");
      }

      //======================================
      // PUTリクエスト（予約変更）
      //======================================
      if (path === "/api/reservation" && method === "PUT") {
        return gasPost(request, env, "updateReservationDetail");
      }

      //======================================
      // DELETEリクエスト（キャンセル）
      //======================================
      if (path.startsWith("/api/reservation/") && method === "DELETE") {
        const reservationNo = path.split("/").pop();
        return gasPostWithBody(env, "cancelReservation", { reservationNo });
      }

      //======================================
      // 該当なし
      //======================================
      return json({ success: false, message: "Not Found" }, 404);

    } catch (error) {
      return json({ success: false, message: error.message }, 500);
    }
  }
};

//==================================================
// GAS GET（クエリパラメータ対応）
//==================================================
async function gasGet(env, action, params = {}) {
  let url = `${env.GAS_URL}?action=${action}`;

  for (const key in params) {
    if (params[key]) {
      url += `&${key}=${encodeURIComponent(params[key])}`;
    }
  }

  const res = await fetch(url);
  const text = await res.text();

  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

//==================================================
// GAS POST（通常）
//==================================================
async function gasPost(request, env, action) {
  const body = await request.json();
  body.action = action;

  const res = await fetch(env.GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return json(data);
}

//==================================================
// GAS POST（シンプルなbody送信用）
//==================================================
async function gasPostWithBody(env, action, body) {
  body.action = action;

  const res = await fetch(env.GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return json(data);
}

//==================================================
// JSONレスポンス
//==================================================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

//==================================================
// CORS
//==================================================
function cors() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}