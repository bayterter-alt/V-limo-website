/**
 * 增強型垃圾訊息防護系統
 * 整合到現有的 script.js 中
 */

// 垃圾訊息檢測配置
const SPAM_PROTECTION = {
  // 可疑關鍵字列表
  suspiciousKeywords: [
    // 廣告相關
    '推廣', '優惠', '免費', '贈送', '限時', '特價', '折扣', '促銷',
    'SEO', '排名', '網站優化', '行銷', '廣告', '宣傳',
    
    // 金融詐騙
    '投資', '理財', '股票', '基金', '借款', '貸款', '信用卡',
    '賺錢', '獲利', '報酬', '收益', '利息',
    
    // 常見垃圾內容
    '點擊', '連結', 'http', 'www', '.com', '.tw',
    '加我', '聯繫我', '私訊', 'LINE', 'WeChat',
    
    // 英文垃圾關鍵字
    'free', 'promotion', 'discount', 'offer', 'deal',
    'investment', 'loan', 'money', 'profit', 'earn',
    'click', 'link', 'website', 'marketing', 'seo'
  ],
  
  // 可疑模式
  suspiciousPatterns: [
    /\b(?:https?:\/\/|www\.)[^\s]+/gi, // 網址
    /\b[\w\.-]+@[\w\.-]+\.\w+\b/gi,   // 其他email
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // 信用卡號
    /\b(?:\+886|0)\d{8,9}\b/g,        // 其他電話號碼
    /[\u4e00-\u9fff]{1}\s*[\u4e00-\u9fff]{1}\s*[\u4e00-\u9fff]{1}/g, // 單字間有空格
    /(.)\1{5,}/g,                     // 重複字符
    /[A-Z]{10,}/g,                    // 連續大寫
    /\d{10,}/g                        // 長數字串
  ],
  
  // 評分權重
  weights: {
    keyword: 2,          // 每個可疑關鍵字 +2分
    pattern: 3,          // 每個可疑模式 +3分
    length: 1,           // 內容過短/過長 +1分
    emailMismatch: 5,    // 內容中的email與表單email不符 +5分
    phoneRepeat: 4,      // 重複提交相同電話 +4分
    timePattern: 3       // 異常時間模式 +3分
  },
  
  // 風險等級
  riskLevels: {
    low: 5,      // 0-5分：正常
    medium: 10,  // 6-10分：可疑，需審核
    high: 15     // 11+分：高風險，可能阻擋
  }
};

/**
 * 垃圾訊息檢測主函數
 */
function detectSpam(formData) {
  let spamScore = 0;
  const warnings = [];
  
  const name = formData.get('name') || '';
  const email = formData.get('email') || '';
  const phone = formData.get('phone') || '';
  const message = formData.get('message') || '';
  const subject = formData.get('subject') || '';
  
  const allText = [name, email, phone, message, subject].join(' ').toLowerCase();
  
  console.log('🛡️ 開始垃圾訊息檢測...');
  
  // 1. 關鍵字檢測
  const foundKeywords = [];
  SPAM_PROTECTION.suspiciousKeywords.forEach(keyword => {
    if (allText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
      spamScore += SPAM_PROTECTION.weights.keyword;
    }
  });
  
  if (foundKeywords.length > 0) {
    warnings.push(`可疑關鍵字: ${foundKeywords.join(', ')}`);
  }
  
  // 2. 模式檢測
  const foundPatterns = [];
  SPAM_PROTECTION.suspiciousPatterns.forEach((pattern, index) => {
    const matches = allText.match(pattern);
    if (matches) {
      foundPatterns.push(`模式${index + 1}: ${matches[0]}`);
      spamScore += SPAM_PROTECTION.weights.pattern;
    }
  });
  
  if (foundPatterns.length > 0) {
    warnings.push(`可疑模式: ${foundPatterns.join(', ')}`);
  }
  
  // 3. 內容長度檢測
  if (message.length < 5 || message.length > 1500) {
    spamScore += SPAM_PROTECTION.weights.length;
    warnings.push('訊息長度異常');
  }
  
  // 4. Email 一致性檢測
  const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const emailsInContent = allText.match(emailPattern) || [];
  if (emailsInContent.length > 0 && !emailsInContent.includes(email.toLowerCase())) {
    spamScore += SPAM_PROTECTION.weights.emailMismatch;
    warnings.push('內容中包含不同的email地址');
  }
  
  // 5. 重複電話檢測
  const previousSubmissions = JSON.parse(localStorage.getItem('phoneSubmissions') || '[]');
  if (phone && previousSubmissions.includes(phone)) {
    spamScore += SPAM_PROTECTION.weights.phoneRepeat;
    warnings.push('重複的電話號碼');
  }
  
  // 6. 時間模式檢測 (深夜或異常頻繁)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 23) {
    spamScore += SPAM_PROTECTION.weights.timePattern;
    warnings.push('異常提交時間');
  }
  
  // 記錄電話號碼
  if (phone) {
    previousSubmissions.push(phone);
    if (previousSubmissions.length > 100) {
      previousSubmissions.splice(0, 50); // 只保留最近100筆
    }
    localStorage.setItem('phoneSubmissions', JSON.stringify(previousSubmissions));
  }
  
  const result = {
    score: spamScore,
    warnings: warnings,
    riskLevel: spamScore <= SPAM_PROTECTION.riskLevels.low ? 'low' : 
               spamScore <= SPAM_PROTECTION.riskLevels.medium ? 'medium' : 'high'
  };
  
  console.log('🛡️ 垃圾訊息檢測結果:', result);
  return result;
}

/**
 * 增強的表單驗證（整合垃圾訊息檢測）
 */
function enhancedValidateFormData(formData) {
  // 執行原有驗證
  if (!validateFormData(formData)) {
    return false;
  }
  
  // 執行垃圾訊息檢測
  const spamResult = detectSpam(formData);
  
  if (spamResult.riskLevel === 'high') {
    console.warn('🚫 高風險內容被阻擋:', spamResult.warnings);
    alert('您的訊息包含可疑內容，請檢查後重新提交，或直接電話聯繫我們：04-2520-8777');
    return false;
  }
  
  if (spamResult.riskLevel === 'medium') {
    console.warn('⚠️ 可疑內容，需要額外確認:', spamResult.warnings);
    const userConfirm = confirm('您的訊息將需要額外審核，確定要提交嗎？\n\n如需立即回覆，請直接電話聯繫：04-2520-8777');
    if (!userConfirm) {
      return false;
    }
  }
  
  return true;
}

/**
 * reCAPTCHA v3 整合（可選）
 */
function initializeRecaptcha() {
  // 如果要使用 reCAPTCHA，需要先申請 Site Key
  const RECAPTCHA_SITE_KEY = 'YOUR_RECAPTCHA_SITE_KEY'; // 需要申請
  
  if (RECAPTCHA_SITE_KEY !== 'YOUR_RECAPTCHA_SITE_KEY') {
    // 動態載入 reCAPTCHA
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    document.head.appendChild(script);
    
    window.executeRecaptcha = function() {
      return new Promise((resolve, reject) => {
        grecaptcha.ready(function() {
          grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'contact_form'})
            .then(function(token) {
              resolve(token);
            })
            .catch(reject);
        });
      });
    };
  }
}

/**
 * 地理位置檢測（基於時區）
 */
function detectSuspiciousLocation() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const suspiciousTimeZones = [
    'Europe/Moscow', 'America/New_York', 'Europe/London', 
    'Africa/Lagos', 'Asia/Kolkata'
  ];
  
  if (suspiciousTimeZones.includes(timeZone)) {
    console.warn('⚠️ 可疑地理位置:', timeZone);
    return true;
  }
  
  return false;
}

// 在頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化 reCAPTCHA（如果需要）
  // initializeRecaptcha();
  
  // 記錄頁面載入時間用於機器人檢測
  sessionStorage.setItem('pageLoadTime', Date.now().toString());
});

// 匯出函數供其他腳本使用
window.spamProtection = {
  detectSpam,
  enhancedValidateFormData,
  detectSuspiciousLocation
};