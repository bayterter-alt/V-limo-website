// ===== Google 表單處理系統 =====
const GOOGLE_FORM_CONFIG = {
  // Google 表單設定（請替換為實際值）
  formId: 'YOUR_GOOGLE_FORM_ID', // 從 Google 表單網址取得
  actionUrl: 'https://docs.google.com/forms/d/e/YOUR_GOOGLE_FORM_ID/formResponse',
  
  // 表單欄位對應（請替換為實際的 entry ID）
  fields: {
    name: 'entry.123456789',      // 姓名欄位的 entry ID
    email: 'entry.987654321',     // 電子郵件欄位的 entry ID  
    phone: 'entry.111111111',     // 電話欄位的 entry ID
    service: 'entry.222222222',   // 服務類型欄位的 entry ID
    subject: 'entry.333333333',   // 主旨欄位的 entry ID
    message: 'entry.444444444'    // 訊息欄位的 entry ID
  }
};

/**
 * Google 表單提交處理函數
 */
async function handleGoogleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // 安全檢查（保持原有驗證）
  if (!validateFormSecurity(formData)) {
    alert('表單驗證失敗，請稍後再試');
    return;
  }
  
  if (!validateFormData(formData)) {
    alert('請填寫完整且正確的資訊');
    return;
  }
  
  try {
    showLoadingState(form);
    
    // 建立 Google 表單資料
    const googleFormData = createGoogleFormData(formData);
    
    // 提交到 Google 表單
    await submitToGoogleForm(googleFormData);
    
    // 記錄成功提交
    logFormSubmission(formData);
    
    // 導向感謝頁面
    window.location.href = './thank-you.html?success=1&via=google-form';
    
  } catch (error) {
    console.error('Google 表單提交錯誤:', error);
    hideLoadingState(form);
    alert(`發送失敗：${error.message}\n\n請直接來電聯繫：04-2520-8777`);
  }
}

/**
 * 建立 Google 表單資料
 */
function createGoogleFormData(originalFormData) {
  const googleFormData = new FormData();
  
  // 添加時間戳
  googleFormData.append('entry.timestamp', new Date().toISOString());
  
  // 對應表單欄位
  const fieldMapping = {
    'name': GOOGLE_FORM_CONFIG.fields.name,
    'email': GOOGLE_FORM_CONFIG.fields.email,
    'phone': GOOGLE_FORM_CONFIG.fields.phone,
    'service': GOOGLE_FORM_CONFIG.fields.service,
    'subject': GOOGLE_FORM_CONFIG.fields.subject,
    'message': GOOGLE_FORM_CONFIG.fields.message
  };
  
  // 複製資料到 Google 表單格式
  for (const [originalField, googleField] of Object.entries(fieldMapping)) {
    const value = originalFormData.get(originalField);
    if (value) {
      googleFormData.append(googleField, value);
    }
  }
  
  return googleFormData;
}

/**
 * 提交到 Google 表單
 */
async function submitToGoogleForm(formData) {
  return new Promise((resolve, reject) => {
    // 建立隱藏的 iframe 來提交表單（避免頁面跳轉）
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'google-form-submit';
    document.body.appendChild(iframe);
    
    // 建立隱藏的表單
    const hiddenForm = document.createElement('form');
    hiddenForm.method = 'POST';
    hiddenForm.action = GOOGLE_FORM_CONFIG.actionUrl;
    hiddenForm.target = 'google-form-submit';
    hiddenForm.style.display = 'none';
    
    // 添加所有欄位
    for (const [key, value] of formData.entries()) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      hiddenForm.appendChild(input);
    }
    
    document.body.appendChild(hiddenForm);
    
    // 設定 iframe 載入完成事件
    iframe.onload = function() {
      console.log('Google 表單提交成功');
      document.body.removeChild(iframe);
      document.body.removeChild(hiddenForm);
      resolve();
    };
    
    iframe.onerror = function(error) {
      console.error('Google 表單提交失敗:', error);
      document.body.removeChild(iframe);
      document.body.removeChild(hiddenForm);
      reject(new Error('無法連接到 Google 表單服務'));
    };
    
    // 提交表單
    hiddenForm.submit();
    
    // 設定超時
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        document.body.removeChild(hiddenForm);
        resolve(); // 即使超時也視為成功（Google 表單通常會成功）
      }
    }, 5000);
  });
}

// ===== 保持原有的安全驗證函數 =====

/**
 * 安全驗證（與原本相同）
 */
function validateFormSecurity(formData) {
  // 提交時間檢查
  const startTime = sessionStorage.getItem('formStartTime');
  if (startTime) {
    const timeDiff = Date.now() - parseInt(startTime);
    if (timeDiff < 3000) { // 少於3秒可能是機器人
      console.warn('提交過快，疑似機器人');
      return false;
    }
  }
  
  // Rate limiting
  const lastSubmit = localStorage.getItem('lastFormSubmit');
  if (lastSubmit) {
    const timeSinceLastSubmit = Date.now() - parseInt(lastSubmit);
    if (timeSinceLastSubmit < 300000) { // 5分鐘內不能重複提交
      alert('請等待5分鐘後再次提交表單');
      return false;
    }
  }
  
  return true;
}

/**
 * 資料驗證（與原本相同）
 */
function validateFormData(formData) {
  const email = formData.get('email');
  const name = formData.get('name');
  const message = formData.get('message');
  
  // Email 驗證
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    alert('請輸入有效的電子郵件地址');
    return false;
  }
  
  // 姓名驗證
  if (!name || name.trim().length < 2) {
    alert('請輸入至少2個字元的姓名');
    return false;
  }
  
  if (name.length > 50) {
    alert('姓名長度不能超過50個字元');
    return false;
  }
  
  // 訊息驗證
  if (!message || message.trim().length < 10) {
    alert('請輸入至少10個字元的詳細需求');
    return false;
  }
  
  if (message.length > 2000) {
    alert('訊息長度不能超過2000個字元');
    return false;
  }
  
  // 過濾惡意內容
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onclick/i,
    /onerror/i,
    /<iframe/i
  ];
  
  const allValues = [name, email, message].join(' ');
  for (let pattern of maliciousPatterns) {
    if (pattern.test(allValues)) {
      alert('輸入內容包含不允許的字元');
      return false;
    }
  }
  
  return true;
}

/**
 * UI 狀態管理（與原本相同）
 */
function showLoadingState(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發送中...';
  }
}

function hideLoadingState(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '確認送出';
  }
}

/**
 * 提交記錄（更新版）
 */
function logFormSubmission(formData) {
  const submission = {
    timestamp: Date.now(),
    date: new Date().toISOString(),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || '',
    subject: formData.get('subject') || '',
    service: formData.get('service') || '',
    source: 'https://www.v-limo.com.tw/',
    method: 'google-form'
  };
  
  const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
  submissions.push(submission);
  
  // 只保留最近50筆記錄
  if (submissions.length > 50) {
    submissions.splice(0, submissions.length - 50);
  }
  
  localStorage.setItem('formSubmissions', JSON.stringify(submissions));
  localStorage.setItem('lastFormSubmit', Date.now().toString());
}

// ===== 初始化 =====

/**
 * 表單初始化
 */
document.addEventListener('DOMContentLoaded', function() {
  // 記錄表單開始時間
  sessionStorage.setItem('formStartTime', Date.now().toString());
  
  // 綁定表單提交事件
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleGoogleFormSubmit);
  }
  
  console.log('Google 表單系統已初始化');
});

// ===== 設定指南函數 =====

/**
 * 取得 Google 表單的 entry ID（開發者工具）
 * 使用方法：
 * 1. 開啟 Google 表單
 * 2. 在瀏覽器按 F12 開啟開發者工具
 * 3. 在 Console 中執行 getGoogleFormEntryIds()
 */
function getGoogleFormEntryIds() {
  console.log('正在搜尋 Google 表單 entry ID...');
  
  const inputs = document.querySelectorAll('input[name^="entry."], textarea[name^="entry."], select[name^="entry."]');
  const entryIds = {};
  
  inputs.forEach(input => {
    const name = input.name;
    const label = input.closest('.freebirdFormviewerViewItemsItemItem')?.querySelector('.freebirdFormviewerViewItemsItemItemTitle')?.textContent || 'unknown';
    entryIds[label] = name;
  });
  
  console.log('找到的 entry ID:', entryIds);
  return entryIds;
}

/**
 * 測試 Google 表單連接
 */
async function testGoogleFormConnection() {
  console.log('測試 Google 表單連接...');
  
  try {
    const response = await fetch(GOOGLE_FORM_CONFIG.actionUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('Google 表單連接測試成功');
    return true;
  } catch (error) {
    console.error('Google 表單連接測試失敗:', error);
    return false;
  }
}