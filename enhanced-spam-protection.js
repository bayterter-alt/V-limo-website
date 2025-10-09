/**
 * 增強型垃圾訊息防護系統
 * 整合到現有的 script.js 中
 */

// 垃圾訊息檢測配置
const SPAM_PROTECTION = {
  // 可疑關鍵字列表
  suspiciousKeywords: [
    // 廣告相關
    '推廣服務', '限時優惠', '特價促銷', '免費贈送',
    'SEO優化', '網站排名', '行銷推廣',
    
    // 金融詐騙
    '投資理財', '快速借款', '信用貸款',
    '保證賺錢', '高額獲利', '保證收益',
    
    // 常見垃圾內容
    '點擊連結', '加我LINE', '私訊聯繫',
    
    // 英文垃圾關鍵字（組合詞，避免誤判）
    'free money', 'quick loan', 'guaranteed profit',
    'click here', 'visit website'
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
  
  // 風險等級（調高門檻，避免誤判）
  riskLevels: {
    low: 8,      // 0-8分：正常
    medium: 15,  // 9-15分：可疑，需審核
    high: 20     // 16+分：高風險，可能阻擋
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
  
  // 2. 模式檢測（只檢測訊息內容，排除正常欄位）
  const foundPatterns = [];
  
  // 檢查是否為航班資訊（如果是，跳過大部分檢測）
  const isFlightInfo = message.includes('航班號碼') || message.includes('Flight Number') || 
                       message.includes('✈️ 航班資訊') || message.includes('✈️ Flight Information') ||
                       message.includes('🚗 服務類型');
  
  // 只檢測訊息內容中的可疑網址（排除 email 地址檢測，已在上面單獨處理）
  if (!isFlightInfo) {
    const urlPattern = /\b(?:https?:\/\/|www\.)[^\s]+/gi;
    const urlMatches = message.match(urlPattern);
    if (urlMatches) {
      foundPatterns.push('包含外部連結');
      spamScore += SPAM_PROTECTION.weights.pattern;
    }
  }
  
  // 檢測信用卡號（航班資訊也要檢查）
  const creditCardPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
  if (message.match(creditCardPattern)) {
    foundPatterns.push('包含疑似信用卡號');
    spamScore += SPAM_PROTECTION.weights.pattern;
  }
  
  // 檢測重複字符（排除航班資訊的分隔線）
  if (!isFlightInfo) {
    const repeatPattern = /(.)\1{5,}/g;
    const repeatMatches = message.match(repeatPattern);
    if (repeatMatches) {
      // 排除常見的分隔線符號
      const validRepeats = repeatMatches.filter(match => 
        !match.match(/^[━─-=*#]{6,}$/)
      );
      if (validRepeats.length > 0) {
        foundPatterns.push('包含大量重複字符');
        spamScore += SPAM_PROTECTION.weights.pattern;
      }
    }
  }
  
  if (foundPatterns.length > 0) {
    warnings.push(`可疑內容: ${foundPatterns.join(', ')}`);
  }
  
  // 3. 內容長度檢測（放寬限制，因為航班資訊可能較長）
  if (message.length < 3 || message.length > 3000) {
    spamScore += SPAM_PROTECTION.weights.length;
    warnings.push('訊息長度異常');
  }
  
  // 4. Email 一致性檢測（只檢查訊息內容，不包含表單 email 欄位）
  const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const emailsInMessage = message.match(emailPattern) || [];
  const differentEmails = emailsInMessage.filter(e => e.toLowerCase() !== email.toLowerCase());
  if (differentEmails.length > 0) {
    spamScore += SPAM_PROTECTION.weights.emailMismatch;
    warnings.push('訊息內容中包含不同的email地址');
  }
  
  // 5. 重複電話檢測
  const previousSubmissions = JSON.parse(localStorage.getItem('phoneSubmissions') || '[]');
  if (phone && previousSubmissions.includes(phone)) {
    spamScore += SPAM_PROTECTION.weights.phoneRepeat;
    warnings.push('重複的電話號碼');
  }
  
  // 6. 時間模式檢測（移除深夜限制，因為機場接送服務可能24小時需求）
  // 保留此段落供未來需要時使用
  /*
  const hour = new Date().getHours();
  if (hour < 3 || hour > 23) {
    spamScore += SPAM_PROTECTION.weights.timePattern;
    warnings.push('異常提交時間');
  }
  */
  
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
 * 注意：檢測結果僅記錄在 Console，不會阻止用戶提交
 */
function enhancedValidateFormData(formData) {
  // 執行原有驗證
  if (!validateFormData(formData)) {
    return false;
  }
  
  // 執行垃圾訊息檢測（僅後台記錄，不影響用戶體驗）
  const spamResult = detectSpam(formData);
  
  // 記錄到 Console 供管理員檢視，但不阻止提交
  if (spamResult.riskLevel === 'high') {
    console.warn('🚫 高風險內容檢測:', {
      score: spamResult.score,
      warnings: spamResult.warnings,
      note: '僅記錄，不阻止提交'
    });
  } else if (spamResult.riskLevel === 'medium') {
    console.log('⚠️ 中風險內容檢測:', {
      score: spamResult.score,
      warnings: spamResult.warnings,
      note: '僅記錄，不阻止提交'
    });
  } else {
    console.log('✅ 垃圾訊息檢測通過:', {
      score: spamResult.score,
      riskLevel: spamResult.riskLevel
    });
  }
  
  // 允許所有通過基本驗證的表單提交
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