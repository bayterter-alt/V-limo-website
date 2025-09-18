/**
 * 利盟租車 - Google 表單自動化處理系統
 * 功能：智能郵件路由、自動回覆、專業郵件模板
 */

// ===== 設定區域 =====
const CONFIG = {
  // 收件者設定（根據服務類型分配）
  RECIPIENTS: {
    '機場接送': {
      email: 'airport@chuteng.com.tw',
      name: '機場接送部',
      cc: ['tcs-info@chuteng.com.tw']
    },
    '旅遊包車': {
      email: 'tour@chuteng.com.tw', 
      name: '旅遊包車部',
      cc: ['tcs-info@chuteng.com.tw']
    },
    '露營車出租': {
      email: 'camping@chuteng.com.tw',
      name: '露營車部',
      cc: ['tcs-info@chuteng.com.tw']
    },
    '貨車出租': {
      email: 'truck@chuteng.com.tw',
      name: '貨車部', 
      cc: ['tcs-info@chuteng.com.tw']
    },
    '其他諮詢': {
      email: 'rayterter@hotmail.com',
      name: '客服中心',
      cc: []
    }
  },
  
  // 預設收件者（當服務類型未指定時）
  DEFAULT_RECIPIENT: {
    email: 'tcs-info@chuteng.com.tw',
    name: '客服中心',
    cc: ['rayterter@hotmail.com']
  },
  
  // 公司資訊
  COMPANY: {
    name: '利盟小客車租賃有限公司',
    phone: '04-2520-8777',
    email: 'tcs-info@chuteng.com.tw',
    website: 'https://www.v-limo.com.tw/',
    address: '台中市豐原區豐原大道七段66號'
  }
};

// ===== 主要函數 =====

/**
 * 表單提交觸發器
 * 安裝方式：在 Apps Script 中設定「表單提交」觸發器
 */
function onFormSubmit(e) {
  try {
    console.log('表單提交觸發器啟動');
    
    // 取得提交的資料
    const formData = extractFormData(e);
    console.log('提交資料:', formData);
    
    // 驗證資料
    if (!validateFormData(formData)) {
      console.error('資料驗證失敗');
      return;
    }
    
    // 發送通知郵件給負責部門
    sendNotificationEmail(formData);
    
    // 發送自動回覆給客戶
    sendAutoReply(formData);
    
    // 記錄處理結果
    logSubmission(formData);
    
    console.log('表單處理完成');
    
  } catch (error) {
    console.error('表單處理錯誤:', error);
    sendErrorNotification(error, e);
  }
}

/**
 * 從表單事件中提取資料
 */
function extractFormData(e) {
  // 增加日誌記錄，幫助我們看到底收到了什麼
  console.log('收到的原始事件物件: ' + JSON.stringify(e, null, 2));

  // 防彈檢查：確保 e 物件存在
  if (!e) {
    throw new Error('事件物件 (e) 是 undefined。觸發器沒有正確傳遞事件資料。');
  }

  // 情況一：來自 Google Form 的標準觸發器 (e.response 存在)
  if (e.response) {
    console.log('偵測到 Form 觸發器 (e.response)');
    const itemResponses = e.response.getItemResponses();
    const values = itemResponses.map(itemResponse => itemResponse.getResponse());
    return {
      timestamp: e.response.getTimestamp(),
      name: values[0] || '',
      email: values[1] || '',
      phone: values[2] || '',
      service: values[3] || '',
      subject: values[4] || '',
      message: values[5] || '',
      source: CONFIG.COMPANY.website
    };
  } 
  // 情況二：來自 Google Sheet 的舊式觸發器 (e.values 存在)
  else if (e.values) {
    console.log('偵測到 Sheet 觸發器 (e.values)');
    const values = e.values;
    return {
      timestamp: values[0] ? new Date(values[0]) : new Date(),
      name: values[1] || '',
      email: values[2] || '',
      phone: values[3] || '',
      service: values[4] || '',
      subject: values[5] || '',
      message: values[6] || '', // 假設在試算表中有7個欄位
      source: CONFIG.COMPANY.website
    };
  }
  // 情況三：收到了無法識別的事件物件
  else {
    throw new Error('收到的事件物件 (e) 結構無法識別，它既不包含 "response" 也不包含 "values" 屬性。');
  }
}

/**
 * 驗證表單資料
 */
function validateFormData(data) {
  // 基本欄位檢查
  if (!data.name || !data.email || !data.subject || !data.message) {
    console.error('缺少必要欄位');
    return false;
  }
  
  // Email 格式檢查
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    console.error('無效的 Email 格式');
    return false;
  }
  
  return true;
}

/**
 * 發送通知郵件給負責部門
 */
function sendNotificationEmail(data) {
  // 決定收件者
  const recipient = CONFIG.RECIPIENTS[data.service] || CONFIG.DEFAULT_RECIPIENT;
  
  // 動態主旨
  const dynamicSubject = data.service 
    ? `利盟租車 - ${data.service}諮詢：${data.subject}`
    : `利盟租車 - 客戶諮詢：${data.subject}`;
  
  // 郵件內容
  const emailBody = createNotificationEmailBody(data, recipient);
  
  // 發送郵件
  const mailOptions = {
    to: recipient.email,
    cc: recipient.cc.join(','),
    subject: dynamicSubject,
    htmlBody: emailBody,
    attachments: []
  };
  
  GmailApp.sendEmail(
    mailOptions.to,
    mailOptions.subject,
    '', // 純文字內容（空白，使用 HTML）
    {
      htmlBody: mailOptions.htmlBody,
      cc: mailOptions.cc
    }
  );
  
  console.log(`通知郵件已發送至：${recipient.name} (${recipient.email})`);
}

/**
 * 建立通知郵件內容
 */
function createNotificationEmailBody(data, recipient) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1D4ED8; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 10px; border-bottom: 1px solid #ddd; }
        .info-table .label { font-weight: bold; background: #f0f0f0; width: 150px; }
        .footer { padding: 20px; background: #1D4ED8; color: white; text-align: center; font-size: 12px; }
        .urgent { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 ${CONFIG.COMPANY.name}</h1>
        <h2>新客戶諮詢通知</h2>
        <p>收件部門：${recipient.name}</p>
      </div>
      
      <div class="content">
        <h3>📋 客戶資訊</h3>
        <table class="info-table">
          <tr>
            <td class="label">提交時間</td>
            <td>${Utilities.formatDate(data.timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')}</td>
          </tr>
          <tr>
            <td class="label">客戶姓名</td>
            <td><strong>${data.name}</strong></td>
          </tr>
          <tr>
            <td class="label">聯絡信箱</td>
            <td><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td class="label">聯絡電話</td>
            <td>${data.phone || '未提供'}</td>
          </tr>
          <tr>
            <td class="label">服務類型</td>
            <td><span class="urgent">${data.service || '未指定'}</span></td>
          </tr>
          <tr>
            <td class="label">諮詢主旨</td>
            <td><strong>${data.subject}</strong></td>
          </tr>
        </table>
        
        <h3>💬 客戶訊息</h3>
        <div style="background: white; padding: 15px; border-left: 4px solid #1D4ED8; margin: 15px 0;">
          ${data.message.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px;">
          <h4>📞 建議處理方式</h4>
          <ul>
            <li>請在 <strong>2 小時內</strong> 主動聯繫客戶</li>
            <li>可直接回覆此郵件或致電客戶</li>
            <li>記得更新客戶管理系統</li>
          </ul>
        </div>
      </div>
      
      <div class="footer">
        <p>📍 ${CONFIG.COMPANY.address}</p>
        <p>📞 ${CONFIG.COMPANY.phone} | 📧 ${CONFIG.COMPANY.email}</p>
        <p>🌐 <a href="${CONFIG.COMPANY.website}" style="color: white;">${CONFIG.COMPANY.website}</a></p>
        <p>此郵件由系統自動發送 | 來源：${data.source}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * 發送自動回覆給客戶
 */
function sendAutoReply(data) {
  const replySubject = `✅ 利盟租車收到您的${data.service || ''}諮詢 - 我們將盡快與您聯繫`;
  const replyBody = createAutoReplyBody(data);
  
  GmailApp.sendEmail(
    data.email,
    replySubject,
    '', // 純文字內容
    {
      htmlBody: replyBody,
      name: CONFIG.COMPANY.name
    }
  );
  
  console.log(`自動回覆已發送至：${data.email}`);
}

/**
 * 建立自動回覆內容
 */
function createAutoReplyBody(data) {
  const estimatedResponse = getEstimatedResponseTime(data.service);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1D4ED8; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .highlight { background: #f0f8ff; padding: 15px; border-left: 4px solid #1D4ED8; margin: 15px 0; }
        .contact-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { padding: 20px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 ${CONFIG.COMPANY.name}</h1>
        <h2>感謝您的諮詢！</h2>
      </div>
      
      <div class="content">
        <p>親愛的 <strong>${data.name}</strong> 您好，</p>
        
        <p>感謝您對利盟租車的信任與支持！我們已收到您關於「<strong>${data.service || '服務'}</strong>」的諮詢。</p>
        
        <div class="highlight">
          <h3>📋 您的諮詢資訊</h3>
          <p><strong>服務類型：</strong>${data.service || '未指定'}</p>
          <p><strong>諮詢主旨：</strong>${data.subject}</p>
          <p><strong>預計回覆時間：</strong>${estimatedResponse}</p>
        </div>
        
        <h3>🕐 接下來的流程</h3>
        <ol>
          <li>我們的專業團隊正在處理您的需求</li>
          <li>將在 <strong>${estimatedResponse}</strong> 內主動與您聯繫</li>
          <li>提供詳細的服務說明與報價</li>
          <li>協助您完成預約流程</li>
        </ol>
        
        <div class="contact-info">
          <h3>📞 緊急聯絡方式</h3>
          <p>如有緊急需求，歡迎直接來電：</p>
          <p><strong>客服專線：${CONFIG.COMPANY.phone}</strong></p>
          <p><strong>營業時間：</strong>09:00 - 18:00（週一至週日）</p>
          <p><strong>LINE 官方帳號：</strong>@limo86536170</p>
          <p><strong>線上訂車：</strong><a href="https://v-limo.app/">v-limo.app</a></p>
        </div>
        
        <h3>🎯 為什麼選擇利盟租車？</h3>
        <ul>
          <li>✅ 專業司機，安全可靠</li>
          <li>✅ 車況優良，定期保養</li>
          <li>✅ 價格透明，無隱藏費用</li>
          <li>✅ 24小時客服支援</li>
          <li>✅ 彈性預約，即時確認</li>
        </ul>
        
        <p>再次感謝您的諮詢，期待為您提供優質的租車服務！</p>
        
        <p>利盟租車團隊 敬上</p>
      </div>
      
      <div class="footer">
        <p>${CONFIG.COMPANY.name}</p>
        <p>📍 ${CONFIG.COMPANY.address}</p>
        <p>📞 ${CONFIG.COMPANY.phone} | 📧 ${CONFIG.COMPANY.email}</p>
        <p>🌐 <a href="${CONFIG.COMPANY.website}">${CONFIG.COMPANY.website}</a></p>
      </div>
    </body>
    </html>
  `;
}

/**
 * 根據服務類型預估回覆時間
 */
function getEstimatedResponseTime(service) {
  const timeMap = {
    '機場接送': '1小時',
    '旅遊包車': '2小時', 
    '露營車出租': '4小時',
    '貨車出租': '4小時',
    '其他諮詢': '2小時'
  };
  
  return timeMap[service] || '2小時';
}

/**
 * 記錄提交資料
 */
function logSubmission(data) {
  // 可以在這裡加入 Google Sheets 記錄、分析等功能
  console.log('提交記錄已保存');
}

/**
 * 錯誤通知
 */
function sendErrorNotification(error, originalEvent) {
  const errorEmail = `
    <h2>表單處理錯誤通知</h2>
    <p><strong>錯誤時間：</strong>${new Date()}</p>
    <p><strong>錯誤訊息：</strong>${error.message}</p>
    <p><strong>錯誤堆疊：</strong><pre>${error.stack}</pre></p>
    <p><strong>原始事件：</strong><pre>${JSON.stringify(originalEvent, null, 2)}</pre></p>
  `;
  
  GmailApp.sendEmail(
    CONFIG.DEFAULT_RECIPIENT.email,
    '⚠️ 利盟租車表單系統錯誤',
    '',
    { htmlBody: errorEmail }
  );
}

// ===== 輔助函數 =====

/**
 * 安裝觸發器（手動執行一次即可）
 */
function installTriggers() {
  // 刪除舊的觸發器
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // 取得表單（請替換為您的表單 ID）
  const FORM_ID = '1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A'; // 請替換為實際的表單 ID
  const form = FormApp.openById(FORM_ID);
  
  // 安裝新的觸發器
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
    
  console.log('觸發器安裝完成');
}

/**
 * 測試函數（用於開發測試）
 */
function testFormSubmit() {
  const testData = {
    timestamp: new Date(),
    name: '測試客戶',
    email: 'test@example.com', 
    phone: '0912345678',
    service: '機場接送',
    subject: '測試預約',
    message: '這是一個測試訊息，請忽略。',
    source: CONFIG.COMPANY.website
  };
  
  console.log('開始測試...');
  sendNotificationEmail(testData);
  sendAutoReply(testData);
  console.log('測試完成');
}