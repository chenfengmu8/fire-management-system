// ================== 全域設定 ==================
const CONFIG = {
  MAX_WIDTH: 1024,
  JPEG_QUALITY: 0.75,
  MIN_QUALITY: 0.5,
  RETRY_COUNT: 3,
  RETRY_DELAY_BASE: 500,
  MAX_CONCURRENT_UPLOADS: 5,
  COMPRESSION_TIMEOUT: 8000,
  // ⚠️ 關鍵修正：請填入您的 Google Apps Script 網址 (末端是 /exec)
  API_ENDPOINT: 'https://script.google.com/macros/s/AKfycbzFXhDn18hUPAQVVZrUDFbEcDtpK8mX3BmotcRJUpPAbHvbkRh4EikCwp_ODb-iHAPyTg/exec' 
};

// 表單配置
const FORM_CONFIGS = {
  pre: {
    formId: 'preForm',
    loadingId: 'preFormLoading',
    apiPath: '/api/submit-pre',
    photos: [
      { inputId: 'prePhoto1', statusId: 'prePhoto1Status' },
      { inputId: 'prePhoto2', statusId: 'prePhoto2Status' }
    ],
    statusIds: ['prePhoto1Status', 'prePhoto2Status', 'preFormMsg'],
    validate: () => {
      const checked = document.querySelectorAll('#preItemsContainer input:checked');
      if (checked.length === 0) {
        alert('請至少選擇一個動火項目！');
        return false;
      }
      return true;
    },
    getPayload: () => ({
      company: getFieldValue('preCompany'),
      inputCompany: getFieldValue('preInputCompany'),
      project: getFieldValue('preProject'),
      inputProject: getFieldValue('preInputProject'),
      uploader: getFieldValue('preUploader'),
      department: getFieldValue('preGroup') + ' ' + getFieldValue('preSection'),
      startTime: getFieldValue('preStartTime'),
      endTime: getFieldValue('preEndTime'),
      area: getFieldValue('preArea'),
      location: getFieldValue('preLocation'),
      restricted: getFieldValue('preRestricted'),
      items: Array.from(document.querySelectorAll('#preItemsContainer input:checked'))
              .map(cb => cb.value).join('、')
    })
  },
  during: {
    formId: 'duringForm',
    loadingId: 'duringFormLoading',
    apiPath: '/api/submit-during',
    photos: [
      { inputId: 'duringPhoto1', statusId: 'duringPhoto1Status' },
      { inputId: 'duringPhoto2', statusId: 'duringPhoto2Status' }
    ],
    statusIds: ['duringPhoto1Status', 'duringPhoto2Status', 'duringFormMsg'],
    getPayload: () => ({
      company: getFieldValue('duringCompany'),
      project: getFieldValue('duringProject'),
      location: getFieldValue('duringLocation'), 
      checkRisk: getFieldValue('q1') // 對應 code.gs 欄位
    })
  },
  after: {
    formId: 'afterForm',
    loadingId: 'afterFormLoading',
    apiPath: '/api/submit-after',
    photos: [
      { inputId: 'afterPhoto1', statusId: 'afterPhoto1Status' },
      { inputId: 'afterPhoto2', statusId: 'afterPhoto2Status' }
    ],
    statusIds: ['afterPhoto1Status', 'afterPhoto2Status', 'afterFormMsg'],
    getPayload: () => ({
      company: getFieldValue('afterCompany'),
      project: getFieldValue('afterProject'),
      location: getFieldValue('afterLocation'),
      endTime: getFieldValue('qTime'),
      isClean: getFieldValue('qYesNo')
    })
  }
};

// ================== 切換分頁邏輯 ==================
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(c => c.classList.remove('active'));
    
    // 設定按鈕狀態
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => {
        if(t.textContent.includes(tab === 'pre' ? '動火前' : tab === 'during' ? '動火中' : tab === 'after' ? '動火後' : '查詢')) {
            t.classList.add('active');
        }
    });

    const containerId = tab + 'FormContainer';
    const container = document.getElementById(containerId);
    if (container) container.classList.add('active');
}

// ================== 剩餘功能 (壓縮、上傳、查詢等) ==================
// (此處保留您貼上的 UploadQueue, initApp, resizeImageProgressive 等所有函式...)
// [為了節省篇幅，此處省略，請確保將您剛才貼出的所有其餘 JavaScript 程式碼都包含進來]

// ... 您貼上的所有剩餘代碼 ...

// 最後確保監聽器正確執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

Object.values(FORM_CONFIGS).forEach(setupFormSubmit);
