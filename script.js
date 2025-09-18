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
    const backToTopButton = document.querySelector('.back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.style.display = 'flex';
      } else {
        backToTopButton.style.display = 'none';
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

// ===== 表單處理系統 =====
const FORM_CONFIG = {
  endpoint: 'https://formspree.io/f/xgvljzgp',
  recipients: {
    primary: 'rayterter@hotmail.com',
    cc: ['tcs-info@chuteng.com.tw', 'amy@chuteng.com.tw']
  }
};

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  // 安全檢查
  if (!validateFormSecurity(formData)) {
    alert('表單驗證失敗，請稍後再試');
    return;
  }
  
  if (!validateFormData(formData)) {
    alert('請填寫完整且正確的資訊');
    return;
  }
  
  // 添加多人收件
  FORM_CONFIG.recipients.cc.forEach(email => {
    formData.append('_cc', email);
  });
  
  // 添加額外資訊
  formData.append('_replyto', formData.get('email'));
  formData.append('提交時間', new Date().toLocaleString('zh-TW'));
  formData.append('來源頁面', window.location.href);
  
  try {
    showLoadingState(form);
    
    const response = await fetch(FORM_CONFIG.endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      // 記錄成功提交
      logFormSubmission(formData);
      window.location.href = './thank-you.html?success=1';
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || '表單發送失敗');
    }
    
  } catch (error) {
    console.error('表單提交錯誤:', error);
    hideLoadingState(form);
    alert(`發送失敗：${error.message}\n\n請直接來電聯繫：04-2520-8777`);
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
    source: window.location.href
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