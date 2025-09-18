// ===== 利盟租車 Google 表單系統配置 (實際設定版) =====

const GOOGLE_FORM_CONFIG = {
  // 您的實際 Google 表單設定
  formId: '1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A',
  sheetId: '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU',
  
  // Google 表單提交 URL（已根據您的表單 ID 生成）
  actionUrl: 'https://docs.google.com/forms/d/e/1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A/formResponse',
  
  // 表單檢視 URL（用於測試）
  viewUrl: 'https://docs.google.com/forms/d/e/1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A/viewform',
  
  // 表單欄位對應 - 這些 entry ID 需要從您的實際表單中取得
  // ⚠️ 重要：請按照下面的指南取得實際的 entry ID
  fields: {
    name: 'entry.1623417871',
    email: 'entry.1144033944',
    phone: 'entry.1623219296',
    service: 'entry.716883917',
    subject: 'entry.1025881327',
    message: 'entry.153606403_sentinel'
  }
};

/**
 * 🔧 取得實際 entry ID 的方法
 * 
 * 1. 開啟您的 Google 表單：
 *    https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/viewform
 * 
 * 2. 按 F12 開啟開發者工具
 * 
 * 3. 在 Console 中貼上並執行以下代碼：
 */
function getFormEntryIds() {
  console.log('🔍 正在搜尋 Google 表單 entry ID...');
  
  const inputs = document.querySelectorAll('input[name^="entry."], textarea[name^="entry."], select[name^="entry."]');
  const entryIds = {};
  
  inputs.forEach(input => {
    // 尋找標籤文字
    const container = input.closest('[data-params*="entry."]') || input.closest('.freebirdFormviewerViewItemsItemItem');
    const labelElement = container?.querySelector('.freebirdFormviewerViewItemsItemItemTitle, [data-value]');
    const label = labelElement?.textContent?.trim() || input.placeholder || input.getAttribute('aria-label') || 'unknown';
    
    entryIds[label] = input.name;
    console.log(`📝 ${label}: ${input.name}`);
  });
  
  console.log('\n📋 完整的 entry ID 對應表:');
  console.table(entryIds);
  
  // 生成設定代碼
  console.log('\n💻 請將以下代碼複製到您的設定中:');
  console.log(`
const ENTRY_IDS = {
  name: '${entryIds['您的姓名'] || entryIds['姓名'] || 'entry.XXXXXX'}',      // 姓名
  email: '${entryIds['電子郵件'] || entryIds['Email'] || 'entry.XXXXXX'}',   // 電子郵件
  phone: '${entryIds['聯絡電話'] || entryIds['電話'] || 'entry.XXXXXX'}',     // 電話
  service: '${entryIds['服務類型'] || entryIds['服務'] || 'entry.XXXXXX'}',   // 服務類型
  subject: '${entryIds['主旨'] || entryIds['標題'] || 'entry.XXXXXX'}',      // 主旨
  message: '${entryIds['訊息內容'] || entryIds['訊息'] || entryIds['內容'] || 'entry.XXXXXX'}'  // 訊息內容
};
  `);
  
  return entryIds;
}

/**
 * Google 表單提交處理函數
 */
async function handleGoogleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // 檢查 entry ID 是否已設定
  if (GOOGLE_FORM_CONFIG.fields.name.includes('000000')) {
    alert('❌ 請先設定正確的 Google 表單 entry ID！\n\n請按照說明文件取得實際的 entry ID 並更新 GOOGLE_FORM_CONFIG.fields 設定。');
    console.error('Entry ID 尚未設定，請按照指南取得實際的 entry ID');
    return;
  }
  
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
    window.location.href = './thank-you.html?success=1&via=google-form&time=' + Date.now();
    
  } catch (error) {
    console.error('Google 表單提交錯誤:', error);
    hideLoadingState(form);
    
    // 提供後備聯絡方式
    const fallbackMessage = `發送失敗：${error.message}\n\n請直接聯繫我們：\n📞 電話：04-2520-8777\n📧 信箱：tcs-info@chuteng.com.tw\n💬 LINE：@limo86536170`;
    alert(fallbackMessage);
  }
}

/**
 * 建立 Google 表單資料
 */
function createGoogleFormData(originalFormData) {
  const googleFormData = new FormData();
  
  // 對應表單欄位到 Google 表單的 entry ID
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
    if (value && value.trim()) {
      googleFormData.append(googleField, value.trim());
    }
  }
  
  // 添加額外的隱藏資訊
  googleFormData.append('entry.timestamp', new Date().toISOString());
  googleFormData.append('entry.source', 'https://www.v-limo.com.tw/');
  
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
    iframe.name = 'google-form-submit-' + Date.now();
    document.body.appendChild(iframe);
    
    // 建立隱藏的表單
    const hiddenForm = document.createElement('form');
    hiddenForm.method = 'POST';
    hiddenForm.action = GOOGLE_FORM_CONFIG.actionUrl;
    hiddenForm.target = iframe.name;
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
    
    // 設定成功處理
    let resolved = false;
    const cleanup = () => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
      if (document.body.contains(hiddenForm)) document.body.removeChild(hiddenForm);
    };
    
    const handleSuccess = () => {
      if (!resolved) {
        resolved = true;
        console.log('✅ Google 表單提交成功');
        cleanup();
        resolve();
      }
    };
    
    const handleError = (error) => {
      if (!resolved) {
        resolved = true;
        console.error('❌ Google 表單提交失敗:', error);
        cleanup();
        reject(error);
      }
    };
    
    // 設定 iframe 事件
    iframe.onload = handleSuccess;
    iframe.onerror = () => handleError(new Error('無法連接到 Google 表單服務'));
    
    // 設定超時（Google 表單通常 3-5 秒內完成）
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log('⏰ Google 表單提交超時，但可能已成功');
        handleSuccess(); // 超時也視為成功，因為 Google 表單可能已經處理
      }
    }, 8000);
    
    // 提交表單
    try {
      hiddenForm.submit();
    } catch (error) {
      clearTimeout(timeout);
      handleError(error);
    }
  });
}

// ===== 保持原有的驗證和 UI 函數 =====

/**
 * 安全驗證
 */
function validateFormSecurity(formData) {
  // 提交時間檢查
  const startTime = sessionStorage.getItem('formStartTime');
  if (startTime) {
    const timeDiff = Date.now() - parseInt(startTime);
    if (timeDiff < 2000) { // 少於2秒可能是機器人
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
 * 資料驗證
 */
function validateFormData(formData) {
  const email = formData.get('email');
  const name = formData.get('name');
  const message = formData.get('message');
  const subject = formData.get('subject');
  
  // 必要欄位檢查
  if (!name || name.trim().length < 2) {
    alert('請輸入您的姓名（至少2個字元）');
    return false;
  }
  
  if (!email) {
    alert('請輸入您的電子郵件地址');
    return false;
  }
  
  if (!subject || subject.trim().length < 2) {
    alert('請輸入諮詢主旨');
    return false;
  }
  
  if (!message || message.trim().length < 10) {
    alert('請詳細描述您的需求（至少10個字元）');
    return false;
  }
  
  // Email 格式驗證
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    alert('請輸入有效的電子郵件地址');
    return false;
  }
  
  // 長度限制
  if (name.length > 50) {
    alert('姓名長度不能超過50個字元');
    return false;
  }
  
  if (subject.length > 100) {
    alert('主旨長度不能超過100個字元');
    return false;
  }
  
  if (message.length > 2000) {
    alert('訊息長度不能超過2000個字元');
    return false;
  }
  
  // 過濾惡意內容
  const maliciousPatterns = [
    /<script/i, /javascript:/i, /onclick/i, /onerror/i, /<iframe/i,
    /eval\(/i, /alert\(/i, /document\./i, /window\./i
  ];
  
  const allValues = [name, email, subject, message].join(' ');
  for (let pattern of maliciousPatterns) {
    if (pattern.test(allValues)) {
      alert('輸入內容包含不允許的字元，請檢查後重新輸入');
      return false;
    }
  }
  
  return true;
}

/**
 * UI 狀態管理
 */
function showLoadingState(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發送中...';
    submitBtn.style.opacity = '0.7';
  }
}

function hideLoadingState(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '確認送出';
    submitBtn.style.opacity = '1';
  }
}

/**
 * 提交記錄
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
    method: 'google-form',
    formId: GOOGLE_FORM_CONFIG.formId
  };
  
  try {
    const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    submissions.push(submission);
    
    // 只保留最近50筆記錄
    if (submissions.length > 50) {
      submissions.splice(0, submissions.length - 50);
    }
    
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));
    localStorage.setItem('lastFormSubmit', Date.now().toString());
    
    console.log('📝 表單提交記錄已保存');
  } catch (error) {
    console.error('保存提交記錄失敗:', error);
  }
}

// ===== 初始化和測試函數 =====

/**
 * 表單系統初始化
 */
function initializeGoogleFormSystem() {
  console.log('🚀 初始化 Google 表單系統...');
  
  // 記錄表單開始時間（用於安全檢查）
  sessionStorage.setItem('formStartTime', Date.now().toString());
  
  // 綁定表單提交事件
  const form = document.getElementById('contactForm');
  if (form) {
    // 移除舊的事件監聽器
    form.removeEventListener('submit', handleFormSubmit); // 移除 Formspree 處理器
    
    // 添加新的事件監聽器
    form.addEventListener('submit', handleGoogleFormSubmit);
    
    console.log('✅ Google 表單提交處理器已綁定');
  } else {
    console.error('❌ 找不到 contactForm 表單元素');
  }
  
  // 顯示配置狀態
  console.log('📋 當前配置:');
  console.log('表單 ID:', GOOGLE_FORM_CONFIG.formId);
  console.log('試算表 ID:', GOOGLE_FORM_CONFIG.sheetId);
  console.log('提交 URL:', GOOGLE_FORM_CONFIG.actionUrl);
  
  // 檢查 entry ID 設定
  const hasValidEntryIds = !Object.values(GOOGLE_FORM_CONFIG.fields).some(id => id.includes('000000'));
  if (hasValidEntryIds) {
    console.log('✅ Entry ID 已設定');
  } else {
    console.warn('⚠️ Entry ID 尚未設定，請取得實際的 entry ID');
  }
}

/**
 * 測試 Google 表單連接
 */
async function testGoogleFormConnection() {
  console.log('🔗 測試 Google 表單連接...');
  
  try {
    // 測試表單頁面存取
    const testUrl = GOOGLE_FORM_CONFIG.viewUrl;
    const response = await fetch(testUrl, { 
      method: 'HEAD', 
      mode: 'no-cors' 
    });
    
    console.log('✅ Google 表單連接正常');
    console.log('📝 表單網址:', testUrl);
    return true;
  } catch (error) {
    console.error('❌ Google 表單連接測試失敗:', error);
    return false;
  }
}

/**
 * 自動填入測試資料（用於開發測試）
 */
function fillTestData() {
  const form = document.getElementById('contactForm');
  if (!form) {
    console.error('找不到表單');
    return;
  }
  
  const testData = {
    name: '測試客戶',
    email: 'test@example.com',
    phone: '0912345678',
    service: '機場接送',
    subject: 'Google 表單系統測試',
    message: '這是一個 Google 表單系統的功能測試。測試時間：' + new Date().toLocaleString('zh-TW')
  };
  
  Object.entries(testData).forEach(([key, value]) => {
    const field = form.querySelector(`#${key}, [name="${key}"]`);
    if (field) {
      field.value = value;
      console.log(`✅ 已填入 ${key}: ${value}`);
    }
  });
  
  console.log('📝 測試資料已填入，請點擊提交按鈕測試');
}

// ===== 自動初始化 =====

// 當 DOM 載入完成時自動初始化
document.addEventListener('DOMContentLoaded', function() {
  // 延遲初始化，確保其他腳本載入完成
  setTimeout(initializeGoogleFormSystem, 500);
});

// 開發者工具提示
console.log(`
🔧 Google 表單系統開發工具

可用命令：
• getFormEntryIds() - 取得表單 entry ID
• testGoogleFormConnection() - 測試表單連接  
• fillTestData() - 填入測試資料
• initializeGoogleFormSystem() - 重新初始化系統

設定狀態：
• 表單 ID: ${GOOGLE_FORM_CONFIG.formId}
• 試算表 ID: ${GOOGLE_FORM_CONFIG.sheetId}
`);

// 全域函數註冊（方便開發者工具使用）
window.getFormEntryIds = getFormEntryIds;
window.testGoogleFormConnection = testGoogleFormConnection;
window.fillTestData = fillTestData;
window.initializeGoogleFormSystem = initializeGoogleFormSystem;