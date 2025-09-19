/**
 * 修正版 Google Apps Script - 郵件通知系統
 * 
 * 設置步驟：
 * 1. 前往 Google Sheets: https://docs.google.com/spreadsheets/d/1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU/edit
 * 2. 點擊 擴充功能 → Apps Script
 * 3. 貼上此代碼並保存
 * 4. 設置觸發器：onFormSubmit (表單提交時)
 * 
 * 修正內容：
 * - 移除有問題的 emoji，改用標準文字符號
 * - 修正日期格式化問題
 * - 修正表單 ID 顯示
 */

function onFormSubmit(e) {
  try {
    console.log('郵件通知系統啟動');
    
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
    
    console.log('表單資料:', { name, email, phone, service, subject });
    
    // 決定收件人
    const primaryRecipient = EMAIL_CONFIG.recipients[service] || EMAIL_CONFIG.recipients['其他諮詢'];
    
    // 建立郵件內容
    const emailSubject = `【利盟租車】新的客戶諮詢 - ${service} - ${subject}`;
    
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
    
    const emailBody = `
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
表單 ID：1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A

請盡快回覆客戶諮詢！

此郵件由 Google Forms 自動發送
    `.trim();
    
    // 發送郵件
    console.log('準備發送郵件到:', primaryRecipient);
    
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
    
    console.log('郵件發送成功');
    
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
    console.error('發送郵件時發生錯誤:', error);
    
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
        `表單郵件自動發送系統發生錯誤：

${error.toString()}

時間：${new Date().toLocaleString('zh-TW')}`
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
      '這是一個修正版郵件系統的測試'
    ],
    source: {
      getId: () => '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU'
    }
  };
  
  console.log('開始測試修正版郵件發送...');
  onFormSubmit(testData);
  console.log('測試完成');
}