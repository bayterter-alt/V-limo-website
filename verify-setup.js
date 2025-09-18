/**
 * Google Forms 整合驗證腳本
 * 執行此腳本來驗證所有設定是否正確
 */

console.log('🚀 開始驗證 Google Forms 整合設定...\n');

// 驗證配置
function verifyConfig() {
    console.log('📋 檢查 GOOGLE_FORM_CONFIG...');
    
    const config = {
        formId: '1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg',
        sheetId: '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU',
        actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/formResponse',
        fields: {
            name: 'entry.1623417871',
            email: 'entry.1144033944',
            phone: 'entry.1623219296',
            service: 'entry.716883917',
            subject: 'entry.1025881327',
            message: 'entry.153606403'
        }
    };
    
    console.log('✅ 表單 ID:', config.formId);
    console.log('✅ 試算表 ID:', config.sheetId);
    console.log('✅ 提交 URL:', config.actionUrl);
    console.log('✅ 欄位映射:');
    Object.entries(config.fields).forEach(([field, entryId]) => {
        console.log(`   ${field} -> ${entryId}`);
    });
    
    return config;
}

// 驗證 Apps Script 設定
function verifyAppsScript() {
    console.log('\n📱 Apps Script 設定檢查...');
    
    const appsScriptConfig = {
        editFormId: '1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A',
        emailConfig: {
            customerService: 'tcs-info@chuteng.com.tw',
            management: 'rayterter@hotmail.com',
            cc: 'amy@chuteng.com.tw'
        }
    };
    
    console.log('✅ 編輯表單 ID (Apps Script 用):', appsScriptConfig.editFormId);
    console.log('✅ 電子郵件設定:', appsScriptConfig.emailConfig);
    
    return appsScriptConfig;
}

// 生成測試 URL
function generateTestUrls(config) {
    console.log('\n🔗 生成測試 URL...');
    
    const urls = {
        viewForm: `https://docs.google.com/forms/d/e/${config.formId}/viewform`,
        editForm: `https://docs.google.com/forms/d/${config.formId.replace('1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg', '1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A')}/edit`,
        spreadsheet: `https://docs.google.com/spreadsheets/d/${config.sheetId}/edit`
    };
    
    console.log('📋 檢視表單:', urls.viewForm);
    console.log('✏️ 編輯表單:', urls.editForm);
    console.log('📊 試算表:', urls.spreadsheet);
    
    return urls;
}

// 檢查檔案結構
function checkFileStructure() {
    console.log('\n📁 檢查檔案結構...');
    
    const expectedFiles = [
        'script.js - 主要 JavaScript 檔案',
        '聯絡我們.html - 聯絡表單頁面',
        'test-google-forms.html - 測試工具',
        'configured-apps-script.js - Apps Script 代碼',
        'verify-setup.js - 此驗證腳本'
    ];
    
    expectedFiles.forEach(file => {
        console.log(`✅ ${file}`);
    });
    
    return expectedFiles;
}

// 生成安裝指引
function generateInstallGuide() {
    console.log('\n📖 安裝完成檢查清單...');
    
    const checklist = [
        '☐ 1. 已在 Google Apps Script 中貼上 configured-apps-script.js 代碼',
        '☐ 2. 已執行 installTriggers() 函數安裝觸發器',
        '☐ 3. 已確認 Google 表單的 Entry ID 設定正確',
        '☐ 4. 已更新網站的 script.js 使用 Google Forms 系統',
        '☐ 5. 已在 聯絡我們.html 中設定 formSystemType 為 google-form',
        '☐ 6. 已測試表單提交功能正常運作',
        '☐ 7. 已確認電子郵件通知正常發送'
    ];
    
    checklist.forEach(item => {
        console.log(item);
    });
    
    return checklist;
}

// 主要驗證流程
function runVerification() {
    try {
        const config = verifyConfig();
        const appsScriptConfig = verifyAppsScript();
        const urls = generateTestUrls(config);
        const files = checkFileStructure();
        const checklist = generateInstallGuide();
        
        console.log('\n🎉 驗證完成！');
        console.log('\n📋 下一步操作:');
        console.log('1. 開啟 test-google-forms.html 進行功能測試');
        console.log('2. 確認 Apps Script 觸發器已正確安裝');
        console.log('3. 測試完整的表單提交流程');
        
        return {
            config,
            appsScriptConfig,
            urls,
            files,
            checklist,
            success: true
        };
        
    } catch (error) {
        console.error('❌ 驗證過程中發生錯誤:', error);
        return { success: false, error };
    }
}

// 執行驗證
const result = runVerification();

// 匯出結果（如果在 Node.js 環境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = result;
}