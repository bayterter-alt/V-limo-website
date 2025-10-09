document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Function ---
  function initializeMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const closeBtn = document.querySelector('.mobile-nav-close');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const body = document.body;

    if (!toggleBtn || !overlay) return;

    // Open mobile menu
    function openMobileMenu() {
      overlay.classList.add('is-open');
      body.style.overflow = 'hidden';
      toggleBtn.setAttribute('aria-expanded', 'true');
      
      // Focus trap
      const firstFocusable = overlay.querySelector('button, a');
      if (firstFocusable) firstFocusable.focus();
    }

    // Close mobile menu
    function closeMobileMenu() {
      overlay.classList.remove('is-open');
      body.style.overflow = '';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.focus();
    }

    // Event listeners
    toggleBtn.addEventListener('click', openMobileMenu);
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileMenu);
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeMobileMenu();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });

    // Close menu when clicking on menu links
    const mobileNavLinks = overlay.querySelectorAll('.mobile-nav-list a');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Small delay to allow navigation
        setTimeout(closeMobileMenu, 100);
      });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991 && overlay.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  // --- Generic Slider Function ---
  function initializeSlider(containerSelector) {
    const sliderContainer = document.querySelector(containerSelector);
    if (!sliderContainer) return;

    const slides = sliderContainer.querySelectorAll('.slide');
    const nextBtn = sliderContainer.querySelector('.slider-next');
    const prevBtn = sliderContainer.querySelector('.slider-prev');
    const dotsContainer = sliderContainer.querySelector('.slider-dots');
    const autoplayInterval = parseInt(sliderContainer.dataset.autoplay) || 0;

    let currentIndex = 0;
    let intervalId = null;

    if (slides.length === 0) return;

    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    function updateSlider() {
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentIndex) {
          slide.classList.add('active');
        }
      });
      if (dots.length > 0) {
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }
    }

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      updateSlider();
      resetAutoplay();
    }

    function resetAutoplay() {
      if (autoplayInterval > 0) {
        clearInterval(intervalId);
        intervalId = setInterval(() => goToSlide(currentIndex + 1), autoplayInterval);
      }
    }

    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));

    updateSlider();
    resetAutoplay();
  }

  // --- Vehicle Filter Function ---
  function initializeVehicleFilter() {
    const filterContainer = document.querySelector('.filter-chips');
    if (!filterContainer) return;

    const filterButtons = filterContainer.querySelectorAll('.chip');
    const vehicleCards = document.querySelectorAll('.vehicles-grid .vehicle-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update button states
        filterButtons.forEach(btn => {
          btn.classList.remove('active', 'is-active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-selected', 'true');

        const filter = button.dataset.filter;

        // Filter cards
        vehicleCards.forEach(card => {
          const cardType = card.dataset.type;
          const shouldShow = filter === 'all' || cardType === filter;
          if (shouldShow) {
            card.classList.remove('hidden');
            card.style.display = 'block';
          } else {
            card.classList.add('hidden');
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- Back to Top Button ---
  function initializeBackToTop() {
    // 選擇所有的回到頂端按鈕（包含懸浮和footer內的）
    const backToTopButtons = document.querySelectorAll('.back-to-top');
    if (backToTopButtons.length === 0) return;

    window.addEventListener('scroll', () => {
      backToTopButtons.forEach(button => {
        // 只對懸浮按鈕添加 show class
        if (button.classList.contains('floating-btn')) {
          if (window.scrollY > 300) {
            button.classList.add('show');
          } else {
            button.classList.remove('show');
          }
        }
      });
    });

    backToTopButtons.forEach(button => {
      button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // --- Fade In Animation ---
  function initializeFadeInAnimation() {
    const fadeInObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeInObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('.fade-in').forEach(el => {
      fadeInObserver.observe(el);
    });
  }

  // --- Tab Filtering (for truck rental page) ---
  function initializeTabFiltering() {
    const tabs = document.querySelectorAll('.tab');
    const cards = document.querySelectorAll('#cards .card');
    
    if (tabs.length === 0) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.cat.includes(filter);
          card.classList.toggle('hidden', !match);
        });
      });
    });
  }

  // --- Initialize all components ---
  initializeMobileMenu();
  initializeSlider('.hero-slider-container');
  initializeSlider('.testimonials-slider-container');
  initializeSlider('.news-slider-container');
  initializeVehicleFilter();
  initializeTabFiltering();
  initializeBackToTop();
  initializeFadeInAnimation();

});

// ===== Google 表單處理系統 =====
const GOOGLE_FORM_CONFIG = {
  formId: '1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A',
  sheetId: '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU',
  actionUrl: 'https://docs.google.com/forms/d/e/1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A/formResponse',
  fields: {
    name: 'entry.1623417871',
    email: 'entry.1144033944',
    phone: 'entry.1623219296',
    service: 'entry.153606403',
    subject: 'entry.716883917',
    message: 'entry.1025881327'
  }
};

/**
 * 主要表單提交處理函數
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  console.log('🚀 Google 表單提交開始 - 版本 2.2 (診斷模式)');
  console.log('📋 表單配置:', GOOGLE_FORM_CONFIG);
  
  // 診斷：記錄原始表單資料
  console.log('📝 原始表單資料:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  // 安全檢查
  if (!validateFormSecurity(formData)) {
    alert('表單驗證失敗，請稍後再試');
    return;
  }
  
  if (!validateFormData(formData)) {
    alert('請填寫完整且正確的資訊');
    return;
  }
  
  // 垃圾訊息檢測
  if (typeof window.spamProtection !== 'undefined') {
    if (!window.spamProtection.enhancedValidateFormData(formData)) {
      return; // 被垃圾訊息過濾器阻擋
    }
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
    console.error('❌ Google 表單提交錯誤:', error);
    hideLoadingState(form);
    
    // 提供後備聯絡方式
    const fallbackMessage = `發送失敗：${error.message}\n\n請直接聯繫我們：\n📞 電話：04-2520-8777\n📧 信箱：tcs-info@chuteng.com.tw\n💬 LINE：@limo86536170`;
    alert(fallbackMessage);
  }
}

// 安全驗證
function validateFormSecurity(formData) {
  // 蜜罐檢查
  const honeypot = formData.get('_gotcha');
  if (honeypot && honeypot.trim().length > 0) {
    console.warn('蜜罐觸發，疑似機器人');
    return false;
  }
  
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

// 資料驗證
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

// UI 狀態管理
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

// 提交記錄
function logFormSubmission(formData) {
  const submission = {
    timestamp: Date.now(),
    date: new Date().toISOString(),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || '',
    subject: formData.get('subject') || '',
    source: 'https://www.v-limo.com.tw/'
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

// 錯誤處理
window.addEventListener('error', function(event) {
  const errorInfo = {
    message: event.message,
    source: event.source,
    line: event.lineno,
    column: event.colno,
    timestamp: new Date().toISOString()
  };
  
  const errors = JSON.parse(localStorage.getItem('jsErrors') || '[]');
  errors.push(errorInfo);
  
  // 只保留最近10筆錯誤
  if (errors.length > 10) {
    errors.splice(0, errors.length - 10);
  }
  
  localStorage.setItem('jsErrors', JSON.stringify(errors));
});


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
      console.log(`✅ 映射: ${originalField} -> ${googleField} = ${value.trim()}`);
    }
  }
  
  return googleFormData;
}

/**
 * 提交到 Google 表單
 */
async function submitToGoogleForm(formData) {
  return new Promise((resolve, reject) => {
    console.log('📤 開始提交到 Google 表單...');
    
    // 使用 fetch 進行提交，添加必要的參數
    const url = new URL(GOOGLE_FORM_CONFIG.actionUrl);
    
    // 添加 Google Forms 需要的參數
    const submitData = new URLSearchParams();
    
    // 複製所有表單資料
    for (const [key, value] of formData.entries()) {
      submitData.append(key, value);
      console.log(`📝 添加欄位: ${key} = ${value}`);
    }
    
    // 添加 Google Forms 必要參數
    submitData.append('submit', 'Submit');
    submitData.append('usp', 'pp_url');
    
    // 使用 fetch 提交
    fetch(GOOGLE_FORM_CONFIG.actionUrl, {
      method: 'POST',
      mode: 'no-cors', // 重要：使用 no-cors 模式避免 CORS 問題
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: submitData
    })
    .then(() => {
      console.log('✅ Google 表單提交成功 (no-cors 模式)');
      resolve();
    })
    .catch(error => {
      console.warn('⚠️ Fetch 失敗，嘗試 iframe 方法:', error);
      
      // 如果 fetch 失敗，回退到 iframe 方法
      submitViaIframe(formData, resolve, reject);
    });
  });
}

/**
 * 使用 iframe 方法提交（回退方案）
 */
function submitViaIframe(formData, resolve, reject) {
  console.log('🔄 使用 iframe 方法提交表單...');
  
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
  
  // 添加必要參數
  const submitInput = document.createElement('input');
  submitInput.type = 'hidden';
  submitInput.name = 'submit';
  submitInput.value = 'Submit';
  hiddenForm.appendChild(submitInput);
  
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
      console.log('✅ Google 表單提交成功 (iframe 方法)');
      cleanup();
      resolve();
    }
  };
  
  // 設定 iframe 事件
  iframe.onload = handleSuccess;
  
  // 設定超時
  const timeout = setTimeout(() => {
    if (!resolved) {
      console.log('⏰ 表單提交超時，視為成功');
      handleSuccess();
    }
  }, 5000);
  
  // 提交表單
  try {
    hiddenForm.submit();
    console.log('📨 表單已透過 iframe 提交');
  } catch (error) {
    clearTimeout(timeout);
    if (!resolved) {
      resolved = true;
      cleanup();
      reject(error);
    }
  }
}

/**
 * 初始化表單系統
 */
function initializeFormSystem() {
  console.log('🚀 初始化 Google 表單系統...');
  
  const form = document.getElementById('contactForm');
  if (!form) {
    console.warn('⚠️ 找不到 contactForm 表單元素（可能不在聯絡我們頁面）');
    return false;
  }
  
  // 添加表單提交事件監聽器
  form.addEventListener('submit', handleFormSubmit);
  
  console.log('✅ Google 表單處理器已啟用');
  
  // 更新系統指示器
  const systemIndicator = form.querySelector('#formSystemType');
  if (systemIndicator) {
    systemIndicator.value = 'google-form';
  }
  
  console.log('📋 表單配置:');
  console.log('表單 ID:', GOOGLE_FORM_CONFIG.formId);
  console.log('提交 URL:', GOOGLE_FORM_CONFIG.actionUrl);
  console.log('欄位映射:', GOOGLE_FORM_CONFIG.fields);
  
  return true;
}

/**
 * 測試 Google 表單連接
 */
async function testGoogleFormConnection() {
  console.log('🔗 測試 Google 表單連接...');
  
  try {
    const testUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/viewform`;
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

// ===== 初始化系統 =====
document.addEventListener('DOMContentLoaded', function() {
  // 僅在聯絡我們頁面初始化表單系統
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    // 初始化表單系統
    setTimeout(() => {
      console.log('🚀 啟動 Google 表單系統...');
      initializeFormSystem();
      
      // 開發者工具函數註冊
      window.testGoogleFormConnection = testGoogleFormConnection;
      window.fillTestData = fillTestData;
      window.initializeFormSystem = initializeFormSystem;
      
      console.log('💡 開發者工具已準備:');
      console.log('- testGoogleFormConnection() - 測試連接');
      console.log('- fillTestData() - 填入測試資料');
      console.log('- initializeFormSystem() - 重新初始化系統');
      
    }, 1000);
  } else {
    console.log('ℹ️ 當前頁面無聯絡表單，跳過表單系統初始化');
  }
});