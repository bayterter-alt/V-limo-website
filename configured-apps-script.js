/**
 * 利盟租車 - Google 表單自動化處理系統 (已配置版本)
 * 表單 ID: 1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg
 * 試算表 ID: 1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU
 */

// ===== 設定區域 =====
const CONFIG = {
  // 實際的 Google 表單和試算表 ID
  FORM_ID: '1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg',
  SHEET_ID: '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU',
  
  // 收件者設定（根據服務類型分配）
  RECIPIENTS: {
    '機場接送': {
      email: 'tcs-info@chuteng.com.tw', // 請更新為實際的機場接送部門郵箱
      name: '機場接送部',
      cc: ['rayterter@hotmail.com', 'amy@chuteng.com.tw']
    },
    '旅遊包車': {
      email: 'tcs-info@chuteng.com.tw', // 請更新為實際的旅遊包車部門郵箱
      name: '旅遊包車部',
      cc: ['rayterter@hotmail.com', 'amy@chuteng.com.tw']
    },
    '露營車出租': {
      email: 'tcs-info@chuteng.com.tw', // 請更新為實際的露營車部門郵箱
      name: '露營車部',
      cc: ['rayterter@hotmail.com', 'amy@chuteng.com.tw']
    },
    '貨車出租': {
      email: 'tcs-info@chuteng.com.tw', // 請更新為實際的貨車部門郵箱
      name: '貨車部',
      cc: ['rayterter@hotmail.com', 'amy@chuteng.com.tw']
    },
    '其他諮詢': {
      email: 'tcs-info@chuteng.com.tw',
      name: '客服中心',
      cc: ['rayterter@hotmail.com', 'amy@chuteng.com.tw']
    }
  },
  
  // 預設收件者（當服務類型未指定時）
  DEFAULT_RECIPIENT: {
    email: 'tcs-info@chuteng.com.tw',
    name: '客服中心',
    cc: ['rayterter@hotmail.com', 'amy@chuteng.com.tw']
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
 * 當 Google 表單被提交時自動執行
 */
function onFormSubmit(e) {
  try {
    console.log('表單提交觸發器啟動');
    console.log('收到的資料:', e.values);
    
    // 取得提交的資料
    const formData = extractFormData(e);
    console.log('處理後的資料:', formData);
    
    // 驗證資料
    if (!validateFormData(formData)) {
      console.error('資料驗證失敗');
      return;
    }
    
    // 發送通知郵件給負責部門
    sendNotificationEmail(formData);
    
    // 發送自動回覆給客戶
    sendAutoReply(formData);
    
    // 記錄處理結果到試算表
    logToSheet(formData);
    
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
  const values = e.values;
  const timestamp = values[0]; // Google 表單自動的時間戳
  
  return {
    timestamp: timestamp,
    name: values[1] || '',        // 姓名
    email: values[2] || '',       // 電子郵件
    phone: values[3] || '',       // 聯絡電話
    service: values[4] || '',     // 服務類型
    subject: values[5] || '',     // 主旨
    message: values[6] || '',     // 訊息內容
    source: CONFIG.COMPANY.website,
    formId: CONFIG.FORM_ID
  };
}

/**
 * 驗證表單資料
 */
function validateFormData(data) {
  // 基本欄位檢查
  if (!data.name || !data.email || !data.subject || !data.message) {
    console.error('缺少必要欄位:', {
      name: !!data.name,
      email: !!data.email,
      subject: !!data.subject,
      message: !!data.message
    });
    return false;
  }
  
  // Email 格式檢查
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    console.error('無效的 Email 格式:', data.email);
    return false;
  }
  
  return true;
}

/**
 * 發送通知郵件給負責部門
 */
function sendNotificationEmail(data) {
  try {
    // 決定收件者
    const recipient = CONFIG.RECIPIENTS[data.service] || CONFIG.DEFAULT_RECIPIENT;
    
    // 動態主旨
    const dynamicSubject = data.service 
      ? `利盟租車 - ${data.service}諮詢：${data.subject}`
      : `利盟租車 - 客戶諮詢：${data.subject}`;
    
    // 郵件內容
    const emailBody = createNotificationEmailBody(data, recipient);
    
    // 發送郵件
    GmailApp.sendEmail(
      recipient.email,
      dynamicSubject,
      '', // 純文字內容（空白，使用 HTML）
      {
        htmlBody: emailBody,
        cc: recipient.cc.join(','),
        name: CONFIG.COMPANY.name
      }
    );
    
    console.log(`通知郵件已發送至：${recipient.name} (${recipient.email})`);
    
  } catch (error) {
    console.error('發送通知郵件失敗:', error);
    throw error;
  }
}

/**
 * 建立通知郵件內容
 */
function createNotificationEmailBody(data, recipient) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Microsoft JhengHei', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
        }
        .header { 
          background: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { margin: 0; font-size: 28px; }
        .header h2 { margin: 10px 0; font-size: 18px; font-weight: normal; }
        .content { 
          padding: 30px 20px; 
          background: #f8fafc; 
          max-width: 800px;
          margin: 0 auto;
        }
        .info-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-table td { 
          padding: 15px; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .info-table .label { 
          font-weight: bold; 
          background: #f1f5f9; 
          width: 150px; 
          color: #475569;
        }
        .message-box {
          background: white; 
          padding: 20px; 
          border-left: 4px solid #1D4ED8; 
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .action-box {
          margin-top: 30px; 
          padding: 20px; 
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
          border-radius: 12px;
          border: 1px solid #f59e0b;
        }
        .footer { 
          padding: 25px 20px; 
          background: #1e293b; 
          color: #94a3b8; 
          text-align: center; 
          font-size: 14px; 
        }
        .footer a { color: #60a5fa; text-decoration: none; }
        .urgent { color: #dc2626; font-weight: bold; }
        .success { color: #059669; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 ${CONFIG.COMPANY.name}</h1>
        <h2>新客戶諮詢通知</h2>
        <p>📍 收件部門：${recipient.name}</p>
      </div>
      
      <div class="content">
        <h3>📋 客戶資訊</h3>
        <table class="info-table">
          <tr>
            <td class="label">📅 提交時間</td>
            <td><strong>${Utilities.formatDate(data.timestamp, Session.getScriptTimeZone(), 'yyyy年MM月dd日 HH:mm:ss')}</strong></td>
          </tr>
          <tr>
            <td class="label">👤 客戶姓名</td>
            <td><strong style="font-size: 16px;">${data.name}</strong></td>
          </tr>
          <tr>
            <td class="label">📧 聯絡信箱</td>
            <td><a href="mailto:${data.email}" style="color: #1D4ED8; font-weight: bold;">${data.email}</a></td>
          </tr>
          <tr>
            <td class="label">📱 聯絡電話</td>
            <td><strong>${data.phone || '未提供'}</strong></td>
          </tr>
          <tr>
            <td class="label">🎯 服務類型</td>
            <td><span class="urgent" style="font-size: 16px;">【${data.service || '未指定'}】</span></td>
          </tr>
          <tr>
            <td class="label">📝 諮詢主旨</td>
            <td><strong style="font-size: 16px;">${data.subject}</strong></td>
          </tr>
        </table>
        
        <h3>💬 客戶訊息內容</h3>
        <div class="message-box">
          <p style="margin: 0; font-size: 15px; line-height: 1.7;">
            ${data.message.replace(/\n/g, '<br>')}
          </p>
        </div>
        
        <div class="action-box">
          <h4 style="margin-top: 0; color: #92400e;">⚡ 緊急處理提醒</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>請在 2 小時內</strong> 主動聯繫客戶</li>
            <li>可直接回覆此郵件或致電客戶：<strong>${data.phone || data.email}</strong></li>
            <li>建議提供詳細報價和服務說明</li>
            <li>記得更新客戶管理系統記錄</li>
          </ul>
          
          <p style="margin-bottom: 0; color: #92400e;">
            <strong>💡 提示：</strong>優質的服務響應是我們的競爭優勢！
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>${CONFIG.COMPANY.name}</strong></p>
        <p>📍 ${CONFIG.COMPANY.address}</p>
        <p>📞 ${CONFIG.COMPANY.phone} | 📧 ${CONFIG.COMPANY.email}</p>
        <p>🌐 <a href="${CONFIG.COMPANY.website}">${CONFIG.COMPANY.website}</a></p>
        <p style="margin-top: 15px; font-size: 12px;">
          此郵件由系統自動發送 | 表單 ID: ${data.formId} | 來源: ${data.source}
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * 發送自動回覆給客戶
 */
function sendAutoReply(data) {
  try {
    const replySubject = `✅ 利盟租車已收到您的${data.service || ''}諮詢 - 我們將盡快聯繫您`;
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
    
  } catch (error) {
    console.error('發送自動回覆失敗:', error);
    // 不拋出錯誤，避免影響主要流程
  }
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
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Microsoft JhengHei', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
        }
        .header { 
          background: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .content { 
          padding: 30px 20px; 
          max-width: 700px;
          margin: 0 auto;
        }
        .highlight { 
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
          padding: 20px; 
          border-left: 4px solid #1D4ED8; 
          margin: 20px 0; 
          border-radius: 0 8px 8px 0;
        }
        .contact-info { 
          background: #f8fafc; 
          padding: 25px; 
          border-radius: 12px; 
          margin: 25px 0; 
          border: 1px solid #e2e8f0;
        }
        .footer { 
          padding: 25px 20px; 
          background: #f1f5f9; 
          text-align: center; 
          font-size: 14px; 
          color: #64748b; 
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #1D4ED8;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 10px 5px;
        }
        .steps {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 ${CONFIG.COMPANY.name}</h1>
        <h2>感謝您的諮詢！我們已收到您的需求</h2>
      </div>
      
      <div class="content">
        <p style="font-size: 16px;">親愛的 <strong>${data.name}</strong> 您好，</p>
        
        <p>感謝您對利盟租車的信任與支持！我們已成功收到您關於「<strong style="color: #1D4ED8;">${data.service || '租車服務'}</strong>」的諮詢。</p>
        
        <div class="highlight">
          <h3 style="margin-top: 0;">📋 您的諮詢資訊確認</h3>
          <p><strong>📝 諮詢主旨：</strong>${data.subject}</p>
          <p><strong>🎯 服務類型：</strong>${data.service || '未指定'}</p>
          <p><strong>📅 提交時間：</strong>${Utilities.formatDate(data.timestamp, Session.getScriptTimeZone(), 'yyyy年MM月dd日 HH:mm')}</p>
          <p><strong>⏰ 預計回覆：</strong><span style="color: #059669; font-weight: bold;">${estimatedResponse}內</span></p>
        </div>
        
        <div class="steps">
          <h3>🔄 接下來的服務流程</h3>
          <ol style="padding-left: 20px;">
            <li><strong>專業團隊審核</strong> - 我們的專業顧問正在仔細評估您的需求</li>
            <li><strong>主動聯繫</strong> - 將在 <strong style="color: #dc2626;">${estimatedResponse}</strong> 內主動與您聯繫</li>
            <li><strong>詳細說明</strong> - 提供完整的服務內容與透明報價</li>
            <li><strong>預約確認</strong> - 協助您完成預約並安排後續服務</li>
          </ol>
        </div>
        
        <div class="contact-info">
          <h3 style="margin-top: 0;">📞 如有緊急需求，歡迎直接聯繫</h3>
          <p style="font-size: 18px; margin: 15px 0;">
            <strong>🔥 客服專線：<a href="tel:${CONFIG.COMPANY.phone}" style="color: #dc2626; text-decoration: none;">${CONFIG.COMPANY.phone}</a></strong>
          </p>
          <p><strong>⏰ 營業時間：</strong>09:00 - 18:00（週一至週日）</p>
          <p><strong>💬 LINE 官方：</strong><a href="https://line.me/R/ti/p/@limo86536170" style="color: #00C300;">@limo86536170</a></p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="tel:${CONFIG.COMPANY.phone}" class="btn">📞 立即來電</a>
            <a href="https://v-limo.app/" class="btn">🌐 線上訂車</a>
          </div>
        </div>
        
        <h3>🏆 選擇利盟租車的五大保證</h3>
        <ul style="padding-left: 0; list-style: none;">
          <li style="margin: 10px 0;">✅ <strong>專業司機</strong> - 經驗豐富，安全第一</li>
          <li style="margin: 10px 0;">✅ <strong>車況優良</strong> - 定期保養，品質保證</li>
          <li style="margin: 10px 0;">✅ <strong>價格透明</strong> - 無隱藏費用，明碼標價</li>
          <li style="margin: 10px 0;">✅ <strong>24小時服務</strong> - 全天候客服支援</li>
          <li style="margin: 10px 0;">✅ <strong>彈性預約</strong> - 即時確認，服務到位</li>
        </ul>
        
        <p style="margin-top: 30px; font-size: 16px;">再次感謝您的信任，我們承諾提供最優質的租車服務體驗！</p>
        
        <p style="text-align: right; margin-top: 20px; font-style: italic;">
          <strong>利盟租車服務團隊</strong> 敬上<br>
          <small>${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy年MM月dd日')}</small>
        </p>
      </div>
      
      <div class="footer">
        <p><strong>${CONFIG.COMPANY.name}</strong></p>
        <p>📍 ${CONFIG.COMPANY.address}</p>
        <p>📞 ${CONFIG.COMPANY.phone} | 📧 ${CONFIG.COMPANY.email}</p>
        <p>🌐 <a href="${CONFIG.COMPANY.website}" style="color: #1D4ED8;">${CONFIG.COMPANY.website}</a></p>
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
 * 記錄到試算表（額外處理）
 */
function logToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getActiveSheet();
    
    // 如果需要額外的處理記錄，可以在這裡添加
    // Google 表單已經自動記錄到試算表，這裡可以添加額外的狀態欄位
    
    console.log('資料已記錄到試算表');
  } catch (error) {
    console.error('記錄到試算表失敗:', error);
    // 不拋出錯誤，避免影響主要流程
  }
}

/**
 * 錯誤通知
 */
function sendErrorNotification(error, originalEvent) {
  try {
    const errorEmail = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #dc2626;">⚠️ 表單處理系統錯誤通知</h2>
        <p><strong>錯誤時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
        <p><strong>錯誤訊息：</strong>${error.message}</p>
        <p><strong>表單 ID：</strong>${CONFIG.FORM_ID}</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h4>錯誤詳情：</h4>
          <pre style="white-space: pre-wrap; word-wrap: break-word;">${error.stack}</pre>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px;">
          <h4>原始事件資料：</h4>
          <pre style="white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(originalEvent, null, 2)}</pre>
        </div>
      </div>
    `;
    
    GmailApp.sendEmail(
      CONFIG.DEFAULT_RECIPIENT.email,
      '⚠️ 利盟租車表單系統錯誤 - 需要檢查',
      '',
      { 
        htmlBody: errorEmail,
        cc: 'rayterter@hotmail.com'
      }
    );
  } catch (emailError) {
    console.error('發送錯誤通知失敗:', emailError);
  }
}

// ===== 安裝和管理函數 =====

/**
 * 安裝觸發器（請手動執行一次）
 */
function installTriggers() {
  try {
    // 刪除舊的觸發器
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    // 取得表單
    const form = FormApp.openById(CONFIG.FORM_ID);
    
    // 安裝新的觸發器
    ScriptApp.newTrigger('onFormSubmit')
      .for(form)
      .onFormSubmit()
      .create();
      
    console.log('✅ 觸發器安裝完成');
    console.log('表單 ID:', CONFIG.FORM_ID);
    console.log('試算表 ID:', CONFIG.SHEET_ID);
    
  } catch (error) {
    console.error('❌ 觸發器安裝失敗:', error);
    throw error;
  }
}

/**
 * 測試函數（用於開發測試）
 */
function testFormSubmit() {
  const testEvent = {
    values: [
      new Date(), // 時間戳
      '測試客戶',  // 姓名
      'test@example.com', // 電子郵件
      '0912345678', // 電話
      '機場接送', // 服務類型
      '系統測試預約', // 主旨
      '這是一個系統測試訊息，測試 Google 表單 + Apps Script 自動化功能。請忽略此訊息。\n\n測試時間：' + new Date().toLocaleString('zh-TW') // 訊息內容
    ]
  };
  
  console.log('🧪 開始測試表單處理...');
  onFormSubmit(testEvent);
  console.log('✅ 測試完成');
}

/**
 * 檢查系統狀態
 */
function checkSystemStatus() {
  console.log('🔍 檢查系統狀態...');
  
  try {
    // 檢查表單存取
    const form = FormApp.openById(CONFIG.FORM_ID);
    console.log('✅ 表單存取正常:', form.getTitle());
    
    // 檢查試算表存取
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    console.log('✅ 試算表存取正常:', sheet.getName());
    
    // 檢查觸發器
    const triggers = ScriptApp.getProjectTriggers();
    const formTriggers = triggers.filter(t => t.getHandlerFunction() === 'onFormSubmit');
    console.log(`✅ 觸發器狀態: ${formTriggers.length} 個表單觸發器`);
    
    console.log('🎉 系統狀態檢查完成，一切正常！');
    
  } catch (error) {
    console.error('❌ 系統狀態檢查失敗:', error);
    throw error;
  }
}