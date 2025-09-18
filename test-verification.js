/**
 * Google 表單系統測試驗證腳本
 * 在瀏覽器 Console 中執行以驗證系統功能
 */

// ===== 測試配置 =====
const TEST_CONFIG = {
  // 測試用的假資料
  testData: {
    name: '測試客戶',
    email: 'test@example.com',
    phone: '0912345678',
    service: '機場接送',
    subject: '系統測試',
    message: '這是一個自動化系統測試，請忽略此訊息。測試時間：' + new Date().toLocaleString()
  }
};

// ===== 測試函數 =====

/**
 * 1. 測試 Google 表單連接
 */
async function testGoogleFormConnection() {
  console.log('🔗 測試 Google 表單連接...');
  
  try {
    const response = await fetch(GOOGLE_FORM_CONFIG.actionUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Google 表單連接正常');
    return true;
  } catch (error) {
    console.error('❌ Google 表單連接失敗:', error);
    return false;
  }
}

/**
 * 2. 測試表單欄位對應
 */
function testFieldMapping() {
  console.log('🏷️ 測試表單欄位對應...');
  
  const form = document.getElementById('contactForm');
  if (!form) {
    console.error('❌ 找不到 contactForm');
    return false;
  }
  
  const requiredFields = ['name', 'email', 'subject', 'message'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    const element = form.querySelector(`[name*="${field}"], #${field}`);
    if (!element) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    console.error('❌ 缺少欄位:', missingFields);
    return false;
  }
  
  console.log('✅ 表單欄位對應正確');
  return true;
}

/**
 * 3. 測試表單驗證
 */
function testFormValidation() {
  console.log('🔍 測試表單驗證...');
  
  // 測試空值驗證
  const emptyData = new FormData();
  if (validateFormData(emptyData)) {
    console.error('❌ 空值驗證失敗');
    return false;
  }
  
  // 測試正確資料
  const validData = new FormData();
  validData.append('name', TEST_CONFIG.testData.name);
  validData.append('email', TEST_CONFIG.testData.email);
  validData.append('message', TEST_CONFIG.testData.message);
  
  if (!validateFormData(validData)) {
    console.error('❌ 正確資料驗證失敗');
    return false;
  }
  
  console.log('✅ 表單驗證功能正常');
  return true;
}

/**
 * 4. 測試安全檢查
 */
function testSecurityValidation() {
  console.log('🛡️ 測試安全檢查...');
  
  // 設定表單開始時間（避免過快提交檢查）
  sessionStorage.setItem('formStartTime', (Date.now() - 5000).toString());
  
  const testData = new FormData();
  testData.append('name', TEST_CONFIG.testData.name);
  testData.append('email', TEST_CONFIG.testData.email);
  
  if (!validateFormSecurity(testData)) {
    console.error('❌ 安全驗證失敗');
    return false;
  }
  
  console.log('✅ 安全檢查功能正常');
  return true;
}

/**
 * 5. 測試 localStorage 功能
 */
function testLocalStorage() {
  console.log('💾 測試 localStorage 功能...');
  
  try {
    // 測試寫入
    const testSubmission = {
      timestamp: Date.now(),
      test: true
    };
    
    localStorage.setItem('formSubmissions', JSON.stringify([testSubmission]));
    
    // 測試讀取
    const stored = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    
    if (stored.length === 0 || !stored[0].test) {
      console.error('❌ localStorage 功能異常');
      return false;
    }
    
    console.log('✅ localStorage 功能正常');
    return true;
  } catch (error) {
    console.error('❌ localStorage 測試失敗:', error);
    return false;
  }
}

/**
 * 6. 完整功能測試（模擬真實提交）
 */
async function testCompleteSubmission() {
  console.log('🚀 執行完整功能測試...');
  
  const form = document.getElementById('contactForm');
  if (!form) {
    console.error('❌ 找不到表單');
    return false;
  }
  
  // 填入測試資料
  const fields = {
    name: TEST_CONFIG.testData.name,
    email: TEST_CONFIG.testData.email,
    phone: TEST_CONFIG.testData.phone,
    service: TEST_CONFIG.testData.service,
    subject: TEST_CONFIG.testData.subject,
    message: TEST_CONFIG.testData.message
  };
  
  // 設定表單欄位
  Object.entries(fields).forEach(([key, value]) => {
    const field = form.querySelector(`#${key}, [name="${key}"], [name*="${key}"]`);
    if (field) {
      field.value = value;
    }
  });
  
  console.log('✅ 測試資料已填入表單');
  console.log('ℹ️ 請手動點擊提交按鈕來完成測試');
  
  return true;
}

// ===== 綜合測試函數 =====

/**
 * 執行所有測試
 */
async function runAllTests() {
  console.log('🧪 開始執行 Google 表單系統測試...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Google 表單連接', func: testGoogleFormConnection },
    { name: '表單欄位對應', func: testFieldMapping },
    { name: '表單驗證功能', func: testFormValidation },
    { name: '安全檢查功能', func: testSecurityValidation },
    { name: 'localStorage 功能', func: testLocalStorage }
  ];
  
  let passedTests = 0;
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.func();
      results.push({ name: test.name, passed: result });
      if (result) passedTests++;
    } catch (error) {
      console.error(`❌ ${test.name} 測試異常:`, error);
      results.push({ name: test.name, passed: false, error });
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 測試結果摘要:');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   錯誤: ${result.error.message}`);
    }
  });
  
  console.log(`\n📈 通過率: ${passedTests}/${tests.length} (${Math.round(passedTests/tests.length*100)}%)`);
  
  if (passedTests === tests.length) {
    console.log('🎉 所有測試通過！系統準備就緒。');
    console.log('💡 建議執行 testCompleteSubmission() 進行最終測試');
  } else {
    console.log('⚠️ 部分測試失敗，請檢查設定');
  }
  
  return { passed: passedTests, total: tests.length, results };
}

/**
 * 快速健康檢查
 */
function quickHealthCheck() {
  console.log('⚡ 快速健康檢查...');
  
  const checks = [
    { name: '表單元素', check: () => !!document.getElementById('contactForm') },
    { name: 'Google 表單設定', check: () => typeof GOOGLE_FORM_CONFIG !== 'undefined' },
    { name: '驗證函數', check: () => typeof validateFormData === 'function' },
    { name: 'localStorage', check: () => typeof Storage !== 'undefined' }
  ];
  
  checks.forEach(check => {
    const result = check.check();
    const status = result ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
  });
}

// ===== 使用說明 =====

console.log(`
🧪 Google 表單測試工具已載入

可用的測試函數：
• runAllTests() - 執行完整測試套件
• quickHealthCheck() - 快速健康檢查
• testCompleteSubmission() - 完整提交測試
• testGoogleFormConnection() - 測試 Google 表單連接

使用範例：
runAllTests()
`);

// 自動執行快速檢查
if (typeof window !== 'undefined') {
  setTimeout(quickHealthCheck, 1000);
}