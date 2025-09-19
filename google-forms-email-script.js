/**
 * Google Apps Script 用於自動發送表單回應到指定信箱
 * 設置步驟：
 * 1. 前往 Google Forms → 回應 → Google Sheets
 * 2. 在 Google Sheets 中，點擊 擴充功能 → Apps Script
 * 3. 貼上此代碼並保存
 * 4. 設置觸發器：onFormSubmit
 */

function onFormSubmit(e) {
  try {
    console.log('🚀 表單提交觸發器啟動 - 診斷模式');
    console.log('📊 觸發器事件資料:', JSON.stringify(e, null, 2));
    
    // 診斷：檢查事件來源
    if (e && e.source) {
      console.log('📋 事件來源 ID:', e.source.getId());
      console.log('📋 事件來源類型:', e.source.toString());
    }
    
    // 診斷：檢查回應資料
    if (e && e.values) {
      console.log('📝 原始回應資料:', e.values);
      console.log('📝 回應資料長度:', e.values.length);
    } else {
      console.error('❌ 沒有接收到 e.values 資料');
    }
    
    // 信箱配置
    const EMAIL_CONFIG = {
      // 主要收件人（根據服務類型）
      recipients: {
        '機場接送': 'rayterter@hotmail.com',
        '旅遊包車': 'rayterter@hotmail.com', 
        '露營車出租': 'rayterter@hotmail.com',
        '貨車出租': 'rayterter@hotmail.com',
        '其他諮詢': 'rayterter@hotmail.com'
      },
      // 副本收件人
      ccEmails: ['tcs-info@chuteng.com.tw', 'amy@chuteng.com.tw'],
      // 發送者信箱（使用您的 Google 帳號）
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
    
    console.log('📝 表單資料:', { name, email, phone, service, subject });
    
    // 決定收件人
    const primaryRecipient = EMAIL_CONFIG.recipients[service] || EMAIL_CONFIG.recipients['其他諮詢'];
    
    // 建立郵件內容
    const emailSubject = `【利盟租車】新的客戶諮詢 - ${service} - ${subject}`;
    
    const emailBody = `
🚗 利盟租車 - 新客戶諮詢通知
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 客戶資訊：
• 姓名：${name}
• 電子郵件：${email}
• 聯絡電話：${phone}
• 服務類型：${service}
• 諮詢主旨：${subject}

💬 客戶訊息：
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 提交時間：${new Date(timestamp).toLocaleString('zh-TW')}
🌐 來源：https://www.v-limo.com.tw/
📊 表單 ID：${e.source.getId()}

⚡ 請盡快回覆客戶諮詢！

此郵件由 Google Forms 自動發送
    `.trim();
    
    // 發送郵件
    console.log('📧 準備發送郵件到:', primaryRecipient);
    
    GmailApp.sendEmail(
      primaryRecipient,
      emailSubject,
      emailBody,
      {
        cc: EMAIL_CONFIG.ccEmails.join(','),
        replyTo: email,
        name: '利盟租車網站系統'
      }
    );
    
    console.log('✅ 郵件發送成功');
    
    // 記錄到試算表（可選）
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('郵件記錄');
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'SUCCESS',
        name,
        email,
        service,
        primaryRecipient,
        '郵件發送成功'
      ]);
    }
    
  } catch (error) {
    console.error('❌ 發送郵件時發生錯誤:', error);
    
    // 錯誤記錄
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
    
    // 發送錯誤通知給管理員
    try {
      GmailApp.sendEmail(
        'rayterter@hotmail.com',
        '【錯誤】利盟租車表單郵件發送失敗',
        `表單郵件自動發送系統發生錯誤：\n\n${error.toString()}\n\n時間：${new Date().toLocaleString('zh-TW')}`
      );
    } catch (e) {
      console.error('無法發送錯誤通知:', e);
    }
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
      '這是一個自動郵件系統的測試'
    ],
    source: {
      getId: () => 'TEST_FORM_ID'
    }
  };
  
  console.log('🧪 開始測試郵件發送...');
  onFormSubmit(testData);
  console.log('✅ 測試完成');
}