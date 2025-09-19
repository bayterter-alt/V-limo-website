/**
 * 增強版 Google Apps Script - 包含垃圾訊息過濾
 * 
 * 設置步驟：
 * 1. 前往 Google Sheets: https://docs.google.com/spreadsheets/d/1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU/edit
 * 2. 點擊 擴充功能 → Apps Script
 * 3. 貼上此代碼並保存
 * 4. 設置觸發器：onFormSubmit (表單提交時)
 */

// 垃圾訊息檢測配置
const SPAM_CONFIG = {
  // 可疑關鍵字
  suspiciousKeywords: [
    // 中文垃圾關鍵字
    '推廣', '優惠', '免費', '贈送', '限時', '特價', '折扣', '促銷',
    'SEO', '排名', '網站優化', '行銷', '廣告', '宣傳', '代辦',
    '投資', '理財', '股票', '基金', '借款', '貸款', '信用卡',
    '賺錢', '獲利', '報酬', '收益', '利息', '代書', '當鋪',
    '點擊', '連結', '加我', '聯繫我', '私訊', 'LINE ID', 'WeChat',
    
    // 英文垃圾關鍵字
    'free', 'promotion', 'discount', 'offer', 'deal', 'sale',
    'investment', 'loan', 'money', 'profit', 'earn', 'income',
    'click', 'link', 'website', 'marketing', 'seo', 'business',
    'opportunity', 'guarantee', 'success', 'rich', 'wealthy'
  ],
  
  // 可疑模式
  suspiciousPatterns: [
    /(?:https?:\/\/|www\.)[^\s]+/gi,     // 網址
    /[\w\.-]+@[\w\.-]+\.\w+/gi,          // Email地址
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // 信用卡號格式
    /(.)\1{4,}/g,                        // 重複字符 (5個以上)
    /[A-Z]{8,}/g,                        // 連續大寫字母
    /\d{10,}/g,                          // 長數字串
    /[^\w\s\u4e00-\u9fff\u3000-\u303f]/g // 特殊符號過多
  ],
  
  // 風險評分
  riskThresholds: {
    block: 15,    // 15分以上直接阻擋
    review: 8,    // 8-14分標記需審核
    normal: 0     // 0-7分正常處理
  }
};

function onFormSubmit(e) {
  try {
    console.log('郵件通知系統啟動 - 含垃圾訊息檢測');
    
    // 信箱配置
    const EMAIL_CONFIG = {
      recipients: {
        '機場接送': 'rayterter@hotmail.com',
        '旅遊包車': 'rayterter@hotmail.com', 
        '露營車出租': 'rayterter@hotmail.com',
        '貨車出租': 'rayterter@hotmail.com',
        '其他諮詢': 'rayterter@hotmail.com'
      },
      ccEmails: ['tcs-info@chuteng.com.tw', 'amy@chuteng.com.tw'],
      fromEmail: Session.getActiveUser().getEmail()
    };
    
    // 取得表單回應
    const responses = e.values;
    const timestamp = responses[0];
    const name = responses[1] || '未提供';
    const email = responses[2] || '未提供';
    const phone = responses[3] || '未提供';
    const service = responses[4] || '其他諮詢';
    const subject = responses[5] || '網站表單諮詢';
    const message = responses[6] || '未提供訊息';
    
    console.log('表單資料:', { name, email, phone, service, subject });
    
    // 執行垃圾訊息檢測
    const spamAnalysis = analyzeSpamRisk({
      name, email, phone, service, subject, message, timestamp
    });
    
    console.log('垃圾訊息分析結果:', spamAnalysis);
    
    // 根據風險等級決定處理方式
    if (spamAnalysis.riskScore >= SPAM_CONFIG.riskThresholds.block) {
      console.log('🚫 高風險內容被阻擋:', spamAnalysis.warnings);
      
      // 記錄被阻擋的提交
      logSpamAttempt(spamAnalysis, { name, email, phone, message });
      
      // 發送管理員警告
      sendSpamAlert(spamAnalysis, { name, email, phone, message });
      
      return; // 不發送正常郵件
    }
    
    // 決定收件人
    const primaryRecipient = EMAIL_CONFIG.recipients[service] || EMAIL_CONFIG.recipients['其他諮詢'];
    
    // 建立郵件內容
    let emailSubject = `【利盟租車】新的客戶諮詢 - ${service} - ${subject}`;
    
    // 如果是中風險，在主旨加上標記
    if (spamAnalysis.riskScore >= SPAM_CONFIG.riskThresholds.review) {
      emailSubject = `[需審核] ${emailSubject}`;
    }
    
    // 修正日期格式化
    let formattedDate;
    try {
      if (timestamp) {
        formattedDate = new Date(timestamp).toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } else {
        formattedDate = new Date().toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit', 
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    } catch (error) {
      formattedDate = new Date().toLocaleString('zh-TW');
    }
    
    // 建立郵件內容
    let emailBody = `
[利盟租車] 新客戶諮詢通知
================================

客戶資訊：
• 姓名：${name}
• 電子郵件：${email}
• 聯絡電話：${phone}
• 服務類型：${service}
• 諮詢主旨：${subject}

客戶訊息：
${message}

================================
提交時間：${formattedDate}
來源網站：https://www.v-limo.com.tw/
表單 ID：1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A`;

    // 如果有風險警告，加到郵件中
    if (spamAnalysis.riskScore >= SPAM_CONFIG.riskThresholds.review) {
      emailBody += `

⚠️ 安全提醒 ⚠️
此訊息的風險評分：${spamAnalysis.riskScore}/20
潛在問題：${spamAnalysis.warnings.join(', ')}
建議：請謹慎確認客戶身份後再回覆`;
    }

    emailBody += `

請盡快回覆客戶諮詢！

此郵件由 Google Forms 自動發送`;
    
    // 發送郵件
    console.log('準備發送郵件到:', primaryRecipient);
    
    GmailApp.sendEmail(
      primaryRecipient,
      emailSubject,
      emailBody.trim(),
      {
        cc: EMAIL_CONFIG.ccEmails.join(','),
        replyTo: email,
        name: '利盟租車網站系統'
      }
    );
    
    console.log('郵件發送成功');
    
    // 記錄到試算表
    logFormSubmission({ name, email, service, spamScore: spamAnalysis.riskScore });
    
  } catch (error) {
    console.error('發送郵件時發生錯誤:', error);
    
    // 錯誤處理
    handleEmailError(error);
  }
}

/**
 * 垃圾訊息風險分析
 */
function analyzeSpamRisk(data) {
  let riskScore = 0;
  const warnings = [];
  
  const { name, email, phone, message, subject } = data;
  const allText = [name, email, phone, message, subject].join(' ').toLowerCase();
  
  // 1. 關鍵字檢測
  const foundKeywords = [];
  SPAM_CONFIG.suspiciousKeywords.forEach(keyword => {
    if (allText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
      riskScore += 2;
    }
  });
  
  if (foundKeywords.length > 0) {
    warnings.push(`可疑關鍵字: ${foundKeywords.slice(0, 3).join(', ')}`);
  }
  
  // 2. 模式檢測
  let patternMatches = 0;
  SPAM_CONFIG.suspiciousPatterns.forEach(pattern => {
    const matches = allText.match(pattern);
    if (matches) {
      patternMatches += matches.length;
      riskScore += 3;
    }
  });
  
  if (patternMatches > 0) {
    warnings.push(`可疑模式: ${patternMatches}個`);
  }
  
  // 3. 長度檢測
  if (message.length < 5) {
    riskScore += 4;
    warnings.push('訊息過短');
  } else if (message.length > 1000) {
    riskScore += 2;
    warnings.push('訊息過長');
  }
  
  // 4. 重複字符檢測
  const repeatedChars = message.match(/(.)\1{3,}/g);
  if (repeatedChars) {
    riskScore += 3;
    warnings.push('包含重複字符');
  }
  
  // 5. Email 域名檢測
  const suspiciousDomains = ['tempmail', '10minute', 'guerrilla', 'mailinator'];
  if (suspiciousDomains.some(domain => email.toLowerCase().includes(domain))) {
    riskScore += 5;
    warnings.push('使用臨時郵箱');
  }
  
  // 6. 姓名檢測
  if (name.length < 2 || /^[a-zA-Z\s]*$/.test(name) && name.split(' ').length > 4) {
    riskScore += 2;
    warnings.push('姓名格式異常');
  }
  
  return {
    riskScore: Math.min(riskScore, 20), // 最高20分
    warnings: warnings,
    riskLevel: riskScore >= SPAM_CONFIG.riskThresholds.block ? 'high' : 
               riskScore >= SPAM_CONFIG.riskThresholds.review ? 'medium' : 'low'
  };
}

/**
 * 記錄被阻擋的垃圾訊息
 */
function logSpamAttempt(spamAnalysis, formData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    let spamSheet = sheet.getSheetByName('垃圾訊息記錄');
    
    if (!spamSheet) {
      spamSheet = sheet.insertSheet('垃圾訊息記錄');
      spamSheet.getRange(1, 1, 1, 7).setValues([
        ['時間', '姓名', '郵箱', '電話', '風險分數', '警告', '訊息內容']
      ]);
    }
    
    spamSheet.appendRow([
      new Date(),
      formData.name,
      formData.email,
      formData.phone,
      spamAnalysis.riskScore,
      spamAnalysis.warnings.join('; '),
      formData.message.substring(0, 100) + '...'
    ]);
    
  } catch (error) {
    console.error('記錄垃圾訊息失敗:', error);
  }
}

/**
 * 發送垃圾訊息警告給管理員
 */
function sendSpamAlert(spamAnalysis, formData) {
  try {
    const alertSubject = '【安全警告】利盟租車 - 偵測到高風險表單提交';
    const alertBody = `
安全系統偵測到高風險的表單提交嘗試：

風險評分：${spamAnalysis.riskScore}/20
風險等級：${spamAnalysis.riskLevel}

提交者資訊：
• 姓名：${formData.name}
• 郵箱：${formData.email}
• 電話：${formData.phone}

風險警告：
${spamAnalysis.warnings.join('\n')}

訊息內容：
${formData.message}

時間：${new Date().toLocaleString('zh-TW')}

此提交已被自動阻擋，未發送到正常郵件收件箱。
`;

    GmailApp.sendEmail(
      'rayterter@hotmail.com',
      alertSubject,
      alertBody
    );
    
  } catch (error) {
    console.error('發送垃圾訊息警告失敗:', error);
  }
}

/**
 * 記錄正常表單提交
 */
function logFormSubmission(data) {
  try {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('郵件記錄');
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'SUCCESS',
        data.name,
        data.email,
        data.service,
        'rayterter@hotmail.com',
        `郵件發送成功 (風險分數: ${data.spamScore})`
      ]);
    }
  } catch (error) {
    console.error('記錄提交失敗:', error);
  }
}

/**
 * 錯誤處理
 */
function handleEmailError(error) {
  try {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('郵件記錄');
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'ERROR',
        '系統錯誤',
        '',
        '',
        '',
        error.toString()
      ]);
    }
    
    GmailApp.sendEmail(
      'rayterter@hotmail.com',
      '【錯誤】利盟租車表單郵件發送失敗',
      `表單郵件自動發送系統發生錯誤：

${error.toString()}

時間：${new Date().toLocaleString('zh-TW')}`
    );
  } catch (e) {
    console.error('無法發送錯誤通知:', e);
  }
}

/**
 * 測試函數
 */
function testEmailNotification() {
  const testData = {
    values: [
      new Date().toISOString(),
      '測試客戶',
      'test@example.com',
      '0912345678',
      '其他諮詢',
      '系統測試',
      '這是一個含垃圾訊息防護的測試'
    ],
    source: {
      getId: () => '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU'
    }
  };
  
  console.log('開始測試含垃圾訊息防護的郵件發送...');
  onFormSubmit(testData);
  console.log('測試完成');
}

/**
 * 測試垃圾訊息檢測
 */
function testSpamDetection() {
  const spamTestData = {
    name: '推廣專員',
    email: 'spam@tempmail.com',
    phone: '123456789012',
    message: '免費SEO優化服務！！！限時優惠，點擊連結 http://spam.com 立即獲利!!!',
    subject: '推廣優惠',
    service: '其他諮詢'
  };
  
  const result = analyzeSpamRisk(spamTestData);
  console.log('垃圾訊息測試結果:', result);
  
  return result;
}