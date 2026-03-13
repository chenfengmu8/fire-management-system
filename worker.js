/**
 * 興達動火管理系統 - Cloudflare Worker 代理
 * 功能：
 * 1. 解決跨域請求 (CORS) 問題
 * 2. 繞過 Google Apps Script 的登入驗證頁面
 * 3. 隱藏後端 GAS 實際網址
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 從 Cloudflare Settings > Variables 讀取 GAS_URL
    // 如果您還沒設定變數，也可以暫時直接把網址貼在下方引號內
    const gasUrl = env.GAS_URL || "您的_GOOGLE_APPS_SCRIPT_網址"; 

    // 1. 處理預檢請求 (CORS Preflight)
    // 這是讓瀏覽器允許網頁發送跨網域請求的必要步驟
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. 建立新的 Header，移除可能干擾 Google 驗證的瀏覽器資訊
    const newHeaders = new Headers(request.headers);
    newHeaders.delete("cookie");
    newHeaders.delete("referer");
    newHeaders.delete("origin");

    // 3. 設定轉發參數
    const fetchOptions = {
      method: request.method,
      headers: newHeaders,
      // 關鍵：跟隨 Google 的 302 重導向，在後端完成跳轉
      redirect: "follow", 
    };

    // 如果是 POST 請求（提交資料或上傳照片），複製 Body 內容
    if (request.method === "POST") {
      fetchOptions.body = await request.clone().arrayBuffer();
    }

    try {
      // 4. 向 Google 發送請求
      // 將前端傳來的路徑參數 (如 ?date=2024-03-13) 附加在 GAS 網址後方
      const response = await fetch(gasUrl + url.search, fetchOptions);
      
      // 讀取 Google 回傳的內容
      const body = await response.arrayBuffer();
      
      // 5. 回傳給前端網頁，並強行加上 CORS 許可 Header
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
      // 錯誤處理
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Worker 轉發失敗: " + err.message 
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
      });
    }
  },
};