//================== 全域設定 ==================
const CONFIG = {
  MAX_WIDTH: 1024,
  JPEG_QUALITY: 0.75,
  MIN_QUALITY: 0.5,
  RETRY_COUNT: 3,
  RETRY_DELAY_BASE: 500,
  MAX_CONCURRENT_UPLOADS: 5,
  COMPRESSION_TIMEOUT: 8000,
  // ⚠️ 重要：必須加上 https:// 否則會連線失敗
  API_ENDPOINT: 'https://fire-management-system.chenfengmu8.workers.dev'
};

//================== 輔助函數 ==================
const getFieldValue = (id) => document.getElementById(id)?.value || '';

//================== 表單配置 ==================
const FORM_CONFIGS = {
  pre: {
    formId: 'preForm',
    loadingId: 'preLoading',
    apiPath: '/api/submit-pre',
    statusId: 'preMsg',
    validate: () => {
      const checked = document.querySelectorAll('input[name="preItems"]:checked');
      if (checked.length === 0) {
        showMessage('preMsg', '請至少選擇一個動火項目！', 'error');
        return false;
      }
      return true;
    },
    getPayload: () => {
      const items = Array.from(document.querySelectorAll('input[name="preItems"]:checked')).map(el => el.value);
      return {
        company: getFieldValue('preCompany'),
        inputCompany: getFieldValue('preInputCompany'),
        project: getFieldValue('preProject'),
        inputProject: getFieldValue('preInputProject'),
        uploader: getFieldValue('preUploader'),
        group: getFieldValue('preGroup'),
        department: getFieldValue('preSection'),
        startTime: getFieldValue('preStartTime'),
        endTime: getFieldValue('preEndTime'),
        area: getFieldValue('preArea'),
        location: getFieldValue('preLocation'),
        restricted: getFieldValue('preRestricted'),
        items: items.join(', '),
        photoUrls: [
          window.prePhoto1Url || '',
          window.prePhoto2Url || ''
        ]
      };
    }
  }
};

//================== 核心功能：初始化與事件 ==================
function showMessage(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `status-msg status-${type}`;
  el.style.display = 'block';
}

async function handleFormSubmit(type, e) {
  e.preventDefault();
  const config = FORM_CONFIGS[type];
  if (config.validate && !config.validate()) return;

  const loading = document.getElementById(config.loadingId);
  loading.style.display = 'block';
  showMessage(config.statusId, '正在上傳資料...', 'success');

  try {
    const payload = config.getPayload();
    const response = await fetch(CONFIG.API_ENDPOINT + config.apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success) {
      showMessage(config.statusId, '送出成功！', 'success');
      document.getElementById(config.formId).reset();
    } else {
      throw new Error(result.error || '伺服器回傳錯誤');
    }
  } catch (err) {
    showMessage(config.statusId, '發生錯誤：' + err.message, 'error');
  } finally {
    loading.style.display = 'none';
  }
}

// 綁定事件
document.addEventListener('DOMContentLoaded', () => {
  const preForm = document.getElementById('preForm');
  if (preForm) {
    preForm.addEventListener('submit', (e) => handleFormSubmit('pre', e));
  }
});
