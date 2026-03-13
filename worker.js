// ⚠️ 直接在這裡填入您的 Google Apps Script 網址 (以 /exec 結尾)
const GAS_URL = "https://script.google.com/macros/s/AKfycbzFXhDn18hUPAQVVZrUDFbEcDtpK8mX3BmotcRJUpPAbHvbkRh4EikCwp_ODb-iHAPyTg/exec";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 處理預檢請求 (CORS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. 設定轉寄參數
    const newHeaders = new Headers(request.headers);
    newHeaders.delete("cookie");
    newHeaders.delete("referer");
    newHeaders.delete("origin");

    const fetchOptions = {
      method: request.method,
      headers: newHeaders,
      redirect: "follow",
    };

    if (request.method === "POST") {
      fetchOptions.body = await request.clone().arrayBuffer();
    }

    try {
      // 3. 發送請求到 Google
      const response = await fetch(GAS_URL + url.search, fetchOptions);
      const body = await response.arrayBuffer();

      // 4. 回傳結果並強制加上 CORS 標頭
      return new Response(body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
