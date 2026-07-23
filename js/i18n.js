// js/i18n.js - 網站多語系管理系統
class I18nManager {
  constructor(options = {}) {
    // 選項：是否啟用 IP 地理位置偵測（預設關閉）
    this.useIPDetection = options.useIPDetection || false;
    
    if (this.useIPDetection) {
      this.initWithIPDetection();
    } else {
      this.currentLang = this.detectLanguage();
      this.translations = this.getTranslations();
      this.init();
    }
  }
  
  // IP 地理位置偵測初始化（可選功能）
  async initWithIPDetection() {
    this.currentLang = await this.detectLanguageWithIP();
    this.translations = this.getTranslations();
    this.init();
  }
  
  // 使用 IP 地理位置 API 偵測語言
  async detectLanguageWithIP() {
    // 先檢查 URL 參數和 localStorage（優先級最高）
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && this.isValidLang(langParam)) {
      console.log('🌍 語言來源：URL 參數 -', langParam);
      return langParam;
    }
    
    const savedLang = localStorage.getItem('lang');
    if (savedLang && this.isValidLang(savedLang)) {
      console.log('🌍 語言來源：用戶偏好 -', savedLang);
      return savedLang;
    }
    
    // 使用 IP 偵測（免費 API）
    try {
      console.log('🌍 正在透過 IP 偵測地理位置...');
      const response = await fetch('https://ipapi.co/json/', { timeout: 3000 });
      const data = await response.json();
      const countryCode = data.country_code; // 例如：TW, US, HK
      
      console.log('🌍 偵測到的國家/地區:', countryCode);
      
      // 根據國家代碼決定語言
      const englishCountries = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'SG'];
      if (englishCountries.includes(countryCode)) {
        console.log('🌍 IP 偵測：切換到英文');
        return 'en';
      }
      
      // 繁體中文地區
      const traditionalChineseRegions = ['TW', 'HK', 'MO'];
      if (traditionalChineseRegions.includes(countryCode)) {
        console.log('🌍 IP 偵測：切換到繁體中文');
        return 'zh-TW';
      }
      
      // 如果 IP 偵測失敗或不在上述地區，使用瀏覽器語言
      console.log('🌍 IP 偵測結果不明確，使用瀏覽器語言設定');
      return this.detectLanguageFromBrowser();
      
    } catch (error) {
      console.warn('🌍 IP 偵測失敗，使用瀏覽器語言設定:', error);
      return this.detectLanguageFromBrowser();
    }
  }
  
  // 從瀏覽器語言設定偵測
  detectLanguageFromBrowser() {
    const browserLang = navigator.language || navigator.userLanguage;
    console.log('🌍 瀏覽器語言設定:', browserLang);
    
    if (browserLang.toLowerCase().startsWith('en')) {
      return 'en';
    }
    
    return 'zh-TW';
  }

  // 偵測用戶語言
  detectLanguage() {
    // 1. 檢查 URL 參數（最高優先級）
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && this.isValidLang(langParam)) {
      console.log('🌍 語言來源：URL 參數 -', langParam);
      return langParam;
    }

    // 2. 檢查 localStorage（用戶之前的選擇）
    const savedLang = localStorage.getItem('lang');
    if (savedLang && this.isValidLang(savedLang)) {
      console.log('🌍 語言來源：用戶偏好 -', savedLang);
      return savedLang;
    }

    // 3. 智能檢測瀏覽器語言（自動偵測）✨
    const browserLang = navigator.language || navigator.userLanguage;
    console.log('🌍 瀏覽器語言設定:', browserLang);
    
    // 檢測英文（en, en-US, en-GB, en-AU 等）
    if (browserLang.toLowerCase().startsWith('en')) {
      console.log('🌍 自動切換到：英文');
      return 'en';
    }
    
    // 檢測繁體中文（zh-TW, zh-HK 等）
    if (browserLang === 'zh-TW' || browserLang === 'zh-HK' || browserLang === 'zh-Hant') {
      console.log('🌍 自動切換到：繁體中文');
      return 'zh-TW';
    }
    
    // 其他中文變體也返回繁體中文
    if (browserLang.toLowerCase().startsWith('zh')) {
      console.log('🌍 自動切換到：繁體中文（預設）');
      return 'zh-TW';
    }

    // 4. 默認繁體中文
    console.log('🌍 使用預設語言：繁體中文');
    return 'zh-TW';
  }

  isValidLang(lang) {
    return ['zh-TW', 'en'].includes(lang);
  }

  async init() {
    this.applyTranslations();
    this.bindEvents();
    this.updateLangButtons();
  }

  applyTranslations() {
    // 處理普通文字翻譯
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.dataset.i18n;
      const translation = this.getTranslation(key);
      if (translation) {
        // 處理 HTML 中的 <br> 標籤
        if (translation.includes('<br>')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      } else {
        // 如果翻譯不存在，保留原有內容（不顯示警告）
        // console.warn(`Translation missing for key: ${key}`);
      }
    });

    // 處理 placeholder 翻譯
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const translation = this.getTranslation(key);
      if (translation) {
        el.placeholder = translation;
      }
    });
  }

  getTranslation(key) {
    const keys = key.split('.');
    let result = this.translations[this.currentLang];
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        // 靜默處理缺失的翻譯，避免控制台警告
        return null;
      }
    }
    return result;
  }

  setLanguage(lang) {
    if (!this.isValidLang(lang)) return;
    
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.applyTranslations();
    this.updateLangButtons();

    // 更新 URL (可選)
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
    
    // 觸發語言切換事件，讓其他組件（如 NewsManager）能夠響應
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { lang: lang } 
    }));
  }

  bindEvents() {
    document.querySelectorAll('.lang-btn').forEach(button => {
      button.addEventListener('click', () => {
        this.setLanguage(button.dataset.lang);
      });
    });
  }

  updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(button => {
      button.classList.toggle('active', button.dataset.lang === this.currentLang);
    });
  }

  // 完整翻譯數據
  getTranslations() {
    return {
      'zh-TW': {
        // 導航
        nav: {
          home: '首頁',
          booking: '線上訂車',
          truck: '貨車出租',
          rv: '露營車出租',
          flight: '航班查詢',
          contact: '聯絡我們',
          'book-now': '立即預約'
        },

        // Hero 區塊
        hero: {
          title: '專業、可靠的租賃服務',
          subtitle: '機場接送、旅遊包車、露營車與貨車出租，一次滿足您的所有用車需求。',
          cta: {
            booking: '線上快速預約',
            services: '查看服務項目'
          }
        },

        // 資訊欄
        info: {
          phone: '客服專線',
          hours: '營業時間',
          address: {
            title: '公司地址',
            detail: '台中市豐原區豐原大道七段66號'
          }
        },

        // USP 區塊
        usp: {
          reliable: {
            title: '安心可靠',
            desc: '駕駛經驗豐富，車輛定期保養與清潔，旅程更安心。'
          },
          fast: {
            title: '快速預約',
            desc: '線上即時下單，專人客服即刻回覆，省時又方便。'
          },
          legal: {
            title: '合法經營',
            desc: '依法投保乘客責任險，保障您的每一趟旅程。'
          }
        },

        // 服務區塊
        services: {
          title: '我們的服務',
          subtitle: '無論是商務差旅、家庭出遊或貨物運輸，利盟都能提供最適合您的方案。'
        },
        service: {
          airport: {
            title: '機場接送',
            desc: '專車接送、準時抵達，舒適免煩惱。',
            cta: '立即預約'
          },
          tour: {
            title: '旅遊包車',
            desc: '專屬行程、彈性規劃，輕鬆玩遍全台。',
            cta: '線上訂車'
          },
          rv: {
            title: '露營車出租',
            desc: '開著家去旅行，享受無拘無束的自由。',
            cta: '查看露營車'
          },
          truck: {
            title: '貨車出租',
            desc: '自助搬家、貨物運輸的最佳幫手。',
            cta: '了解詳情'
          }
        },

        // 車輛區塊
        vehicles: {
          title: '精選車型',
          subtitle: '我們提供多樣化、高品質的車輛，滿足您的不同需求。',
          filter: {
            all: '全部',
            business: '商務接送',
            rv: '露營旅行',
            truck: '貨物運輸'
          },
          more: '更多車型介紹'
        },
        vehicle: {
          granvia: {
            category: '豪華商務首選',
            seats: '6–8 人座',
            use: '機場接送 / 商務包車'
          },
          rv: {
            title: '露營車',
            category: '戶外探險家',
            features: '雙床位｜駐車空調｜小廚房',
            use: '家庭旅遊 / 車泊露營'
          },
          truck: {
            title: '堅達貨車',
            category: '載貨好幫手',
            capacity: '載重約 3.5 噸',
            use: '自助搬家 / 貨物運輸'
          },
          cta: {
            book: '線上訂車',
            contact: '立即預約',
            specs: '查看規格',
            reserve: '線上預約',
            quick: '快速預約'
          }
        },

        // 步驟區塊
        steps: {
          title: '三步驟，輕鬆預約',
          subtitle: '簡單直覺的預約流程，讓您快速完成訂車，安心等待出發。',
          step1: {
            title: '選擇搭車的地點',
            desc: '依您的需求，挑選你想預定的地點與車輛。'
          },
          step2: {
            title: '填寫預約資訊',
            desc: '輸入日期、時間、地點與聯絡方式。'
          },
          step3: {
            title: '確認訂單出發',
            desc: '結帳送出訂單，平台24小時為您服務。'
          },
          cta: '現在就預約'
        },

        // 關於區塊
        about: {
          title: '自 1990 年起，<br>您的最佳用車夥伴',
          quote: '我們始終堅持「以客為尊、服務至上」的初衷。',
          desc: '利盟提供租賃、定點接送、包車旅遊等全方位用車服務。我們是您的專家，致力於讓每一段旅程更安心、舒適、便利。',
          feature1: '透明報價，流程清楚無隱憂',
          feature2: '車輛齡新，內裝乾淨又舒適',
          feature3: '專人服務，溝通迅速最貼心'
        },

        // 評價區塊
        testimonials: {
          title: '客戶的聲音',
          subtitle: '您的滿意是我們前進的最大動力。'
        },

        // FAQ 區塊
        faq: {
          title: '常見問答',
          q1: {
            question: '如何預約？',
            answer: '您可以透過網站上的「立即預約」按鈕，到我們的平台上進行線上預約，或直接撥打客服專線，我們將有專人盡快為您服務並完成派車。'
          },
          q2: {
            question: '是否提供發票或收據？',
            answer: '是的，我們可以依您的需求開立收據或統一發票，請於預約時主動告知並提供抬頭與統編。'
          },
          q3: {
            question: '接送地點有限制嗎？',
            answer: '我們提供全台各地的接送服務，包含機場、高鐵站、飯店、住家等指定地點，費用將依您的實際路線計價。'
          }
        },

        // CTA 區塊
        cta: {
          title: '準備好出發了嗎？',
          subtitle: '行程規劃交給我們，您只需享受旅程。',
          consult: '線上諮詢',
          book: '立即預約'
        },

        // 最新消息區塊
        news: {
          title: '最新消息',
          subtitle: '關注利盟租車的最新資訊、優惠活動及服務公告。'
        },

        // Footer
        footer: {
          company: '利盟小客車租賃有限公司',
          contact: {
            title: '聯絡我們',
            phone: '電話',
            fax: '傳真',
            email: '聯絡信箱',
            hours: '營業時間'
          },
          explore: {
            title: '探索',
            booking: '線上訂車',
            vehicles: '交通接送車型介紹'
          },
          support: {
            title: '支援',
            flight: '航班查詢',
            contact: '聯絡我們',
            privacy: '隱私權政策',
            terms: '服務條款'
          },
          quick: {
            title: '快速操作',
            call: '立即來電預約',
            message: '線上留言'
          },
          cta: {
            call: '立即來電',
            contact: '聯絡我們'
          },
          copyright: 'Copyright © 利盟小客車租賃有限公司',
          meta: {
            privacy: '隱私權政策',
            terms: '服務條款',
            top: '回到頂端'
          }
        },

        // 手機底部固定按鈕
        sticky: {
          book: '一鍵快速預約'
        },

        // 露營車頁面
        rv: {
          hero: {
            title1: '開啟您的',
            title2: '自由旅程',
            subtitle: '駕駛著家，探索台灣每個角落。專業配備的露營車，讓您的旅程充滿無限可能。家庭出遊、情侶旅行、朋友探險，都能找到最適合的選擇。',
            cta1: '查看車款',
            cta2: '租賃規範'
          },
          features: {
            title: '為什麼選擇我們的露營車',
            subtitle: '專業配備，貼心服務，讓您的旅程安心無憂',
            feature1: {
              title: '移動的家',
              desc: '床鋪、空調、露營器具一應俱全，讓您在旅途中享受家的溫馨舒適。'
            },
            feature2: {
              title: '自由行程',
              desc: '不受飯店預訂限制，想去哪就去哪，隨心所欲規劃專屬旅程。'
            },
            feature3: {
              title: '專業維護',
              desc: '定期保養檢查，確保車況良好，讓您的旅程安全又安心。'
            }
          },
          vehicles: {
            title: '精選露營車款',
            subtitle: '每台車都是您冒險旅程的完美夥伴'
          },
          location: {
            title: '租用據點',
            taichung: '台中取車點：',
            search: 'Google 地圖搜尋：利盟小客車/小貨車/Rutrip出租取車點'
          },
          pricing: {
            title: '租賃價格',
            weekday: '平日租金',
            weekend: '假日租金',
            per24h: '/24H（兩天一夜）',
            'weekday.note': '星期一至星期四',
            'weekend.note': '星期五六日，政府公告之國定假日及連續假日',
            overtime: '逾時還車計價：',
            overdue: '逾期加收費用：',
            'overdue.note': '逾時未滿1小時以1小時計價，逾時超過6小時以24小時計價',
            insurance: '保險：',
            'insurance.note': '需額外收費，本公司只提供強制險'
          },
          interior: {
            title: '內裝配備展示'
          },
          equipment: {
            title: '隨車配件',
            basic: '基礎設備',
            power: '電力系統',
            kitchen: '廚房設備',
            bathroom: '衛浴設備',
            other: '其他配備'
          },
          specs: {
            title: '車輛規格',
            model: '車型：',
            mileage: '里程：',
            deposit: '押金：',
            passengers: '乘客數：',
            beds: '床位數：'
          }
        },

        // 貨車頁面
        truck: {
          hero: {
            title: '專業貨車出租服務',
            subtitle: '無論是大量物品搬運、趟送貨物、臨時調車或短期專案，我們都為您準備就緒。備有多款廂車、貨卡與3.5T大貨車，租期彈性，為您提供最高效的解決方案。',
            cta1: '查看車款與價目',
            cta2: '了解租賃規範'
          }
        },

        // 聯絡我們頁面
        contact: {
          hero: {
            title: '與我們聯繫',
            subtitle: '我們很樂意聽見您的聲音，歡迎透過以下方式與我們聯繫。'
          },
          info: {
            phone: {
              title: '客服專線',
              hours: '營業時間：09:00 - 18:00'
            },
            email: {
              title: '電子郵件'
            },
            line: {
              title: 'LINE 官方帳號',
              service: '快速預約服務'
            },
            address: {
              title: '公司地址',
              detail: '台中市豐原區豐原大道七段66號'
            },
            website: {
              title: '線上訂車系統',
              available: '24小時線上預約'
            }
          },
          form: {
            title: '傳送訊息給我們',
            subtitle: '有任何問題或建議，請填寫右方表單，我們的客服團隊將會盡快回覆您。',
            name: '您的姓名',
            email: '電子郵件',
            phone: '聯絡電話',
            service: {
              label: '服務類型',
              placeholder: '請選擇服務類型',
              airport: '機場接送',
              tour: '旅遊包車',
              rv: '露營車出租',
              truck: '貨車出租',
              other: '其他諮詢'
            },
            subject: '主旨',
            message: {
              label: '訊息內容',
              placeholder: '請詳細描述您的需求，包含日期、時間、地點等資訊'
            },
            submit: '確認送出'
          }
        },

        // 交通接送車型介紹頁面
        'vehicles-page': {
          hero: {
            title: '頂級車隊陣容',
            subtitle: '頂級車隊陣容，滿足您所有的交通需求。從豪華保母車到商務轎車，我們提供最舒適、安全的交通服務。'
          },
          tab: {
            exterior: '外觀',
            interior: '內裝'
          },
          'features-title': '車輛特色',
          spec: {
            capacity: '乘載人數',
            size: '車身尺寸',
            ac: '空調系統',
            luggage: '行李空間',
            safety: '安全配備',
            seating: '座椅配置',
            route: '適用路線'
          },
          // Vehicle 1: VW Crafter 2022
          v1: {
            'img-ext': '展示豪華保母車外觀設計',
            'img-int': '展示頭等艙豪華內裝空間',
            category: '頂級豪華',
            name: '豪華保母車 Volkswagen Crafter 2022',
            slogan: '陸地頭等艙豪華享受',
            'capacity-val': '8人 (含行李)',
            'ac-val': '獨立後座冷氣',
            'f1-title': '超大空間',
            'f1-desc': '後車廂空間達3,201-4,051mm，連身高190cm成人都可輕鬆站立行走',
            'f2-title': '智能座椅系統',
            'f2-desc': '鋁合金滑軌地板，6張快拆獨立座椅可靈活調整',
            'f3-title': '全景式窗戶',
            'f3-desc': '兩側大型固定窗提供乘客絕佳觀景視野',
            'f4-title': '車艙收納',
            'f4-desc': '天花板收納空間設計，方便存放個人物品'
          },
          // Vehicle 2: VW Crafter 2015
          v2: {
            'img-ext': '明星保母車高級外觀設計',
            'img-int': '9人座豪華座椅與寬敞行李空間',
            category: '高級首選',
            name: '豪華保母車 Volkswagen Crafter 2015',
            slogan: '移動式豪華頭等艙',
            'capacity-val': '8人 (含行李)',
            'luggage-val': '超大行李置放空間',
            features: '明星保母車特色',
            desc: '明星保母車高級首選，Crafter擁有無與倫比的乘客艙空間，提供舒適的9人座配置。已成為明星保母車、高級遊覽車的首選車款。除了9人座配置，更擁有超大行李空間，輕鬆容納所有乘客的大型行李。'
          },
          // Vehicle 3: VW T6
          v3: {
            'img-ext': '包車首選頂級車種外觀',
            'img-int': '寬敞明亮座艙與頂級安全配備',
            category: '包車首選',
            name: 'Volkswagen T6',
            slogan: '包車首選頂級車種',
            'capacity-val': '7人',
            'safety-val': '全頂級安全系統',
            'safety-title': '安全配備',
            s1: '電子行車穩定系統',
            s2: '防鎖死煞車系統',
            s3: '電子煞車力道分配系統',
            s4: '電子防滑差速器',
            s5: '加速循跡控制系統',
            s6: '減速循跡控制系統',
            desc: '寬敞、明亮的福斯T6座艙，配載全最頂級的安全配備，讓每一趟旅程都安全舒適。'
          },
          // Vehicle 4: Toyota Granvia
          v4: {
            'img-ext': '禮遇不凡的豪華外觀設計',
            'img-int': 'Captain豪華皮質座椅與舒適懸吊',
            category: '禮遇不凡',
            name: 'Toyota Granvia',
            slogan: '禮遇不凡的豪華體驗',
            'capacity-val': '5人 (含行李)',
            'seating-val': 'Captain豪華皮質座椅',
            'cabin-title': '豪華座艙',
            desc: '為滿足急速成長的高品質旅遊需求，Granvia全車系標配後座第1、2排Captain豪華皮質座椅，獨立的座椅與扶手讓乘客擁有個人專屬的乘坐空間，賦予如家一般自在、舒適的安全感，降低長時間乘車的負擔與疲勞。',
            'suspension-title': '前麥花臣後四連桿懸吊',
            'suspension-desc': '有效減緩來自路面的震動，帶給後座乘客舒適的乘坐體驗'
          },
          // Vehicle 5: IVECO Medium Bus
          v5: {
            'img-ext': '歐系IVECO中型客車專業外觀',
            'img-int': '豪華三排大座椅與專業配備',
            category: '山區專用',
            name: '歐系 IVECO 中型客車',
            slogan: '豪華寬敞的舒適乘坐體驗',
            'capacity-val': '23人 (含專業司機)',
            'route-val': '特定山區路線',
            'equip-title': '專業配備',
            'f1-title': '豪華三排大座椅',
            'f1-desc': '寬敞舒適的乘坐空間',
            'f2-title': '氣壓式懸吊系統',
            'f2-desc': '提供更穩定舒適的行駛體驗',
            'f3-title': '油壓減速器',
            'f3-desc': '避免山區煞車溫度過高，確保安全',
            'route-title': '特定路線服務',
            r1: '司馬庫斯',
            r2: '大雪山',
            r3: '嘉義梅山',
            r4: '明池森林遊樂區'
          },
          // Vehicle 6: Mercedes V250D
          v6: {
            'img-ext': '豪華舒適的選擇',
            'img-int': 'M-Benz V-Class V250d',
            category: '舒適奢華',
            name: 'Mercedes V250D',
            slogan: '新時代的智慧奢華行車體驗',
            'capacity-val': '6人 (含專業司機)',
            'luggage-val': '4件 (27吋)',
            'luxury-title': 'Maybach 級奢華配備',
            desc: 'M-BENZ V-CLASS V250D 是一款豪華六人座廂型車，擁有寬敞舒適的內裝與高質感配備，非常適合商務接送與家庭旅遊使用。',
            l1: '頂級航太座椅',
            l2: '娛樂系統',
            l3: '全景式電動天窗',
            l4: 'Burmester 3D環繞音響',
            l5: '電動門',
            l6: '室內環景照明系統'
          },
          // Vehicle 7: Toyota Camry Hybrid
          v7: {
            'img-ext': '雅致舒適的高級房車外觀',
            'img-int': 'Toyota Safety Sense 2.0智能內裝',
            category: '環保節能',
            name: 'Toyota Camry Hybrid',
            slogan: '雅致舒適的高級房車',
            'capacity-val': '3人 (含專業司機)',
            'luggage-val': '2件 (27吋)',
            'tech-title': 'Toyota Safety Sense 2.0',
            desc: '升級「Toyota Safety Sense 2.0智動駕駛輔助系統」，全車最高搭載34項主、被動安全防護系統，提供駕駛與乘客更完整的安全防護。',
            t1: 'AHB智慧型遠光燈自動切換',
            t2: 'PCS預警式防護系統',
            t3: '緊急閃避轉向輔助',
            t4: 'ACC全速域主動式車距維持',
            t5: 'LTA車道循跡輔助系統',
            t6: 'Stop & Go功能'
          },
          notice: {
            title: '重要提醒',
            content: '以上車輛內裝僅供參考，實際內裝以現場車輛為主。我們保證提供的每台車輛都經過嚴格檢查，確保安全與舒適。'
          },
          cta: {
            title: '立即預約專屬用車',
            subtitle: '專業司機、頂級車輛、貼心服務，讓每趟旅程都成為美好回憶',
            book: '線上預約',
            call: '立即來電'
          }
        },

        // 航班查詢頁面
        flight: {
          title: '✈️ 航班資訊查詢',
          subtitle: '輸入航班號碼，快速查詢航班資訊並預約機場接送',
          input: {
            placeholder: '例如：BR123, CI001, EVA001'
          },
          search: '查詢航班',
          quickLinks: '快速查詢：',
          tpe: '桃園機場',
          result: {
            departure: '起飛時間',
            arrival: '抵達時間',
            terminal: '航廈',
            airline: '航空公司'
          },
          useInfo: '使用此航班資訊預約接送',
          notice: {
            title: '提示：',
            content: '查詢到航班資訊後，點擊「使用此航班資訊預約接送」按鈕，系統將自動跳轉至預約表單並填入航班資訊，您只需補充姓名、聯絡方式等基本資料即可完成預約。'
          }
        }
      },

      'en': {
        // Navigation
        nav: {
          home: 'Home',
          booking: 'Online Booking',
          truck: 'Truck Rental',
          rv: 'RV Rental',
          flight: 'Flight Search',
          contact: 'Contact Us',
          'book-now': 'Book Now'
        },

        // Hero Section
        hero: {
          title: 'Professional & Reliable Rental Services',
          subtitle: 'Airport transfers, chartered tours, RV & truck rentals. All your transportation needs in one place.',
          cta: {
            booking: 'Quick Online Booking',
            services: 'View Services'
          }
        },

        // Info Bar
        info: {
          phone: 'Customer Service',
          hours: 'Business Hours',
          address: {
            title: 'Address',
            detail: 'No. 66, Sec. 7, Fengyuan Ave., Fengyuan Dist., Taichung City'
          }
        },

        // USP Section
        usp: {
          reliable: {
            title: 'Safe & Reliable',
            desc: 'Experienced drivers, regularly maintained and cleaned vehicles for a worry-free journey.'
          },
          fast: {
            title: 'Quick Booking',
            desc: 'Instant online booking with dedicated customer service for quick responses.'
          },
          legal: {
            title: 'Licensed & Insured',
            desc: 'Fully insured passenger liability coverage to protect every journey.'
          }
        },

        // Services Section
        services: {
          title: 'Our Services',
          subtitle: 'Whether for business travel, family trips, or cargo transport, 利盟 (V-LIMO) provides the perfect solution for you.'
        },
        service: {
          airport: {
            title: 'Airport Transfer',
            desc: 'Private car service, punctual arrival, comfortable and worry-free.',
            cta: 'Book Now'
          },
          tour: {
            title: 'Charter Service',
            desc: 'Customized itineraries with flexible planning to explore Taiwan with ease.',
            cta: 'Online Booking'
          },
          rv: {
            title: 'RV Rental',
            desc: 'Travel with your home, enjoy the freedom of the road.',
            cta: 'View RVs'
          },
          truck: {
            title: 'Truck Rental',
            desc: 'Your best partner for self-moving and cargo transportation.',
            cta: 'Learn More'
          }
        },

        // Vehicles Section
        vehicles: {
          title: 'Featured Vehicles',
          subtitle: 'We offer diverse, high-quality vehicles to meet your different needs.',
          filter: {
            all: 'All',
            business: 'Business',
            rv: 'Camping',
            truck: 'Cargo'
          },
          more: 'More Vehicles'
        },
        vehicle: {
          granvia: {
            category: 'Luxury Business Choice',
            seats: '6–8 Seats',
            use: 'Airport Transfer / Business Charter'
          },
          rv: {
            title: 'RV',
            category: 'Outdoor Explorer',
            features: 'Double Beds | A/C | Kitchenette',
            use: 'Family Travel / Camping'
          },
          truck: {
            title: 'Cargo Truck',
            category: 'Cargo Helper',
            capacity: 'Capacity: ~3.5 tons',
            use: 'Self-Moving / Cargo Transport'
          },
          cta: {
            book: 'Online Booking',
            contact: 'Reserve Now',
            specs: 'View Specs',
            reserve: 'Online Booking',
            quick: 'Quick Reserve'
          }
        },

        // Steps Section
        steps: {
          title: 'Easy Booking in 3 Steps',
          subtitle: 'Simple and intuitive booking process to quickly complete your reservation.',
          step1: {
            title: 'Choose Your Location',
            desc: 'Select your desired pickup location and vehicle based on your needs.'
          },
          step2: {
            title: 'Fill in Details',
            desc: 'Enter date, time, location, and contact information.'
          },
          step3: {
            title: 'Confirm & Go',
            desc: 'Complete payment and submit your order. 24/7 service available.'
          },
          cta: 'Book Now'
        },

        // About Section
        about: {
          title: 'Since 1990,<br>Your Best Transportation Partner',
          quote: 'We always uphold the principle of "Customer First, Service First".',
          desc: '利盟小客車租賃 provides comprehensive car services including rental, point-to-point transfer, and charter tours. As your transportation expert, we are committed to making every journey safer, more comfortable, and more convenient.',
          feature1: 'Transparent pricing with clear processes',
          feature2: 'New vehicles with clean and comfortable interiors',
          feature3: 'Dedicated service with fast communication'
        },

        // Testimonials Section
        testimonials: {
          title: 'Customer Reviews',
          subtitle: 'Your satisfaction is our greatest motivation.'
        },

        // FAQ Section
        faq: {
          title: 'FAQ',
          q1: {
            question: 'How to make a reservation?',
            answer: 'You can click the "Book Now" button on our website to make an online reservation through our platform, or call our customer service hotline directly. Our staff will serve you promptly and arrange the vehicle.'
          },
          q2: {
            question: 'Do you provide invoices or receipts?',
            answer: 'Yes, we can issue receipts or unified invoices according to your needs. Please inform us and provide the header and tax ID number when making a reservation.'
          },
          q3: {
            question: 'Are there restrictions on pickup/drop-off locations?',
            answer: 'We provide transfer services throughout Taiwan, including airports, HSR stations, hotels, residences, and other designated locations. Fees are calculated based on your actual route.'
          }
        },

        // CTA Section
        cta: {
          title: 'Ready to Go?',
          subtitle: 'Leave the planning to us, just enjoy the journey.',
          consult: 'Online Inquiry',
          book: 'Book Now'
        },

        // News Section
        news: {
          title: 'Latest News',
          subtitle: 'Stay updated with 利盟\'s latest information, promotions, and service announcements.'
        },

        // Footer
        footer: {
          company: '利盟小客車租賃有限公司',
          contact: {
            title: 'Contact Us',
            phone: 'Phone',
            fax: 'Fax',
            email: 'Email',
            hours: 'Business Hours'
          },
          explore: {
            title: 'Explore',
            booking: 'Online Booking',
            vehicles: 'Vehicle Introduction'
          },
          support: {
            title: 'Support',
            flight: 'Flight Search',
            contact: 'Contact Us',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service'
          },
          quick: {
            title: 'Quick Actions',
            call: 'Call to Reserve',
            message: 'Online Message'
          },
          cta: {
            call: 'Call Now',
            contact: 'Contact Us'
          },
          copyright: 'Copyright © 利盟小客車租賃有限公司',
          meta: {
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            top: 'Back to Top'
          }
        },

        // Mobile Sticky Bar
        sticky: {
          book: 'Quick Booking'
        },

        // RV Rental Page
        rv: {
          hero: {
            title1: 'Start Your',
            title2: 'Freedom Journey',
            subtitle: 'Drive your home and explore every corner of Taiwan. Professionally equipped RVs make your journey full of possibilities. Perfect for family trips, couple travels, and friend adventures.',
            cta1: 'View Vehicles',
            cta2: 'Rental Terms'
          },
          features: {
            title: 'Why Choose Our RVs',
            subtitle: 'Professional equipment and thoughtful service for a worry-free journey',
            feature1: {
              title: 'Mobile Home',
              desc: 'Equipped with beds, air conditioning, and camping gear for a cozy journey.'
            },
            feature2: {
              title: 'Freedom Journey',
              desc: 'No hotel booking restrictions. Go wherever you want with your own itinerary.'
            },
            feature3: {
              title: 'Professional Maintenance',
              desc: 'Regular maintenance and inspections ensure vehicle safety for peace of mind.'
            }
          },
          vehicles: {
            title: 'Featured RV Fleet',
            subtitle: 'Every vehicle is your perfect adventure partner'
          },
          location: {
            title: 'Pickup Locations',
            taichung: 'Taichung Pickup:',
            search: 'Google Maps Search: 利盟小客車/小貨車/Rutrip Rental Pickup Point'
          },
          pricing: {
            title: 'Rental Pricing',
            weekday: 'Weekday Rate',
            weekend: 'Weekend Rate',
            per24h: '/24H (2 Days 1 Night)',
            'weekday.note': 'Monday to Thursday',
            'weekend.note': 'Friday, Saturday, Sunday, and Public Holidays',
            overtime: 'Late Return Fee:',
            overdue: 'Overdue Fee:',
            'overdue.note': 'Less than 1 hour charged as 1 hour, over 6 hours charged as 24 hours',
            insurance: 'Insurance:',
            'insurance.note': 'Additional charge required, we only provide compulsory insurance'
          },
          interior: {
            title: 'Interior & Equipment'
          },
          equipment: {
            title: 'Included Equipment',
            basic: 'Basic Equipment',
            power: 'Power System',
            kitchen: 'Kitchen Equipment',
            bathroom: 'Bathroom Facilities',
            other: 'Other Equipment'
          },
          specs: {
            title: 'Vehicle Specifications',
            model: 'Model:',
            mileage: 'Mileage:',
            deposit: 'Deposit:',
            passengers: 'Passengers:',
            beds: 'Beds:'
          }
        },

        // Truck Rental Page
        truck: {
          hero: {
            title: 'Professional Truck Rental Service',
            subtitle: 'Whether for bulk cargo transport, deliveries, temporary transfers, or short-term projects, we are ready to serve you. With various vans, cargo trucks, and 3.5T large trucks, flexible rental periods provide the most efficient solution for you.',
            cta1: 'View Vehicles & Pricing',
            cta2: 'Rental Terms'
          }
        },

        // Contact Us Page
        contact: {
          hero: {
            title: 'Contact Us',
            subtitle: 'We\'d love to hear from you. Feel free to reach out through any of the following methods.'
          },
          info: {
            phone: {
              title: 'Customer Service',
              hours: 'Business Hours: 09:00 - 18:00'
            },
            email: {
              title: 'Email'
            },
            line: {
              title: 'LINE Official Account',
              service: 'Quick Booking Service'
            },
            address: {
              title: 'Address',
              detail: 'No. 66, Sec. 7, Fengyuan Ave., Fengyuan Dist., Taichung City'
            },
            website: {
              title: 'Online Booking System',
              available: '24/7 Online Reservations'
            }
          },
          form: {
            title: 'Send Us a Message',
            subtitle: 'If you have any questions or suggestions, please fill out the form and our customer service team will respond as soon as possible.',
            name: 'Your Name',
            email: 'Email',
            phone: 'Phone Number',
            service: {
              label: 'Service Type',
              placeholder: 'Please select service type',
              airport: 'Airport Transfer',
              tour: 'Charter Service',
              rv: 'RV Rental',
              truck: 'Truck Rental',
              other: 'Other Inquiry'
            },
            subject: 'Subject',
            message: {
              label: 'Message',
              placeholder: 'Please describe your needs in detail, including date, time, location, etc.'
            },
            submit: 'Submit'
          }
        },
        
        // Vehicles Introduction Page
        'vehicles-page': {
          hero: {
            title: 'Premium Transportation Fleet',
            subtitle: 'Top-tier fleet lineup to meet all your transportation needs. From luxury vans to business sedans, we provide the most comfortable and safe transportation services.'
          },
          tab: {
            exterior: 'Exterior',
            interior: 'Interior'
          },
          'features-title': 'Vehicle Features',
          spec: {
            capacity: 'Passenger Capacity',
            size: 'Vehicle Size',
            ac: 'Air Conditioning',
            luggage: 'Luggage Space',
            safety: 'Safety Features',
            seating: 'Seating Configuration',
            route: 'Applicable Routes'
          },
          // Vehicle 1: VW Crafter 2022
          v1: {
            'img-ext': 'Showcasing the luxury van exterior design',
            'img-int': 'Showcasing first-class luxury interior space',
            category: 'Top Luxury',
            name: 'Luxury Van Volkswagen Crafter 2022',
            slogan: 'Land First Class Luxury',
            'capacity-val': '8 Passengers (with luggage)',
            'ac-val': 'Independent Rear A/C',
            'f1-title': 'Ultra Spacious',
            'f1-desc': 'Rear cabin space up to 3,201-4,051mm, even adults 190cm tall can walk comfortably',
            'f2-title': 'Smart Seating System',
            'f2-desc': 'Aluminum alloy sliding floor, 6 quick-release independent seats with flexible adjustment',
            'f3-title': 'Panoramic Windows',
            'f3-desc': 'Large fixed windows on both sides providing passengers with scenic views',
            'f4-title': 'Cabin Storage',
            'f4-desc': 'Ceiling storage space design for convenient storage of personal items'
          },
          // Vehicle 2: VW Crafter 2015
          v2: {
            'img-ext': 'Celebrity van premium exterior design',
            'img-int': '9-seater luxury seats and spacious luggage space',
            category: 'Premium Choice',
            name: 'Luxury Van Volkswagen Crafter 2015',
            slogan: 'Mobile Luxury First Class',
            'capacity-val': '8 Passengers (with luggage)',
            'luggage-val': 'Extra spacious large luggage compartment',
            features: 'Celebrity Van Features',
            desc: 'The celebrity van premium choice, Crafter boasts unparalleled passenger cabin space, offering comfortable 9-seater configuration. It has become the top choice for celebrity vans and premium tour vehicles. In addition to 9-seat configuration, it features ultra-spacious luggage space that easily accommodates all passengers\' large luggage.'
          },
          // Vehicle 3: VW T6
          v3: {
            'img-ext': 'Premium charter vehicle exterior',
            'img-int': 'Spacious bright cabin with top safety features',
            category: 'Charter Choice',
            name: 'Volkswagen T6',
            slogan: 'Premium Charter Vehicle',
            'capacity-val': '7 Passengers',
            'safety-val': 'Full Premium Safety System',
            'safety-title': 'Safety Features',
            s1: 'Electronic Stability Control',
            s2: 'Anti-lock Braking System',
            s3: 'Electronic Brake Force Distribution',
            s4: 'Electronic Differential Lock',
            s5: 'Acceleration Traction Control',
            s6: 'Deceleration Traction Control',
            desc: 'Spacious and bright VW T6 cabin, equipped with the most premium safety features, ensuring every journey is safe and comfortable.'
          },
          // Vehicle 4: Toyota Granvia
          v4: {
            'img-ext': 'Luxurious exterior design of distinction',
            'img-int': 'Captain luxury leather seats with comfortable suspension',
            category: 'Distinguished Service',
            name: 'Toyota Granvia',
            slogan: 'Distinguished Luxury Experience',
            'capacity-val': '5 Passengers (with luggage)',
            'seating-val': 'Captain Luxury Leather Seats',
            'cabin-title': 'Luxury Cabin',
            desc: 'To meet the rapidly growing demand for high-quality travel, Granvia comes standard with Captain luxury leather seats in the 1st and 2nd rows. Independent seats and armrests give passengers their own personal seating space, providing comfort and security like home, reducing fatigue from long journeys.',
            'suspension-title': 'MacPherson Front & Four-Link Rear Suspension',
            'suspension-desc': 'Effectively reduces road vibrations, providing rear passengers with a comfortable riding experience'
          },
          // Vehicle 5: IVECO Medium Bus
          v5: {
            'img-ext': 'European IVECO medium bus professional exterior',
            'img-int': 'Luxury three-row large seats with professional equipment',
            category: 'Mountain Routes',
            name: 'European IVECO Medium Bus',
            slogan: 'Luxurious Spacious Comfortable Ride',
            'capacity-val': '23 Passengers (with professional driver)',
            'route-val': 'Specific Mountain Routes',
            'equip-title': 'Professional Equipment',
            'f1-title': 'Luxury Three-Row Large Seats',
            'f1-desc': 'Spacious and comfortable seating',
            'f2-title': 'Air Suspension System',
            'f2-desc': 'Provides more stable and comfortable driving experience',
            'f3-title': 'Hydraulic Retarder',
            'f3-desc': 'Prevents brake overheating in mountains, ensuring safety',
            'route-title': 'Specific Route Services',
            r1: 'Smangus',
            r2: 'Dasyueshan',
            r3: 'Chiayi Meishan',
            r4: 'Mingchi Forest Recreation Area'
          },
          // Vehicle 6: Mercedes V250D
          v6: {
            'img-ext': 'Luxurious and comfortable choice',
            'img-int': 'M-Benz V-Class V250d',
            category: 'Comfortable Luxury',
            name: 'Mercedes V250D',
            slogan: 'New Era of Smart Luxury Driving Experience',
            'capacity-val': '6 Passengers (with professional driver)',
            'luggage-val': '4 pieces (27 inch)',
            'luxury-title': 'Maybach-Level Luxury Features',
            desc: 'M-BENZ V-CLASS V250D is a luxury 6-seater van with spacious and comfortable interior and high-quality equipment, perfect for business transfers and family travel.',
            l1: 'Premium Aviation Seats',
            l2: 'Entertainment System',
            l3: 'Panoramic Electric Sunroof',
            l4: 'Burmester 3D Surround Sound',
            l5: 'Electric Doors',
            l6: 'Interior Ambient Lighting System'
          },
          // Vehicle 7: Toyota Camry Hybrid
          v7: {
            'img-ext': 'Elegant and comfortable luxury sedan exterior',
            'img-int': 'Toyota Safety Sense 2.0 intelligent interior',
            category: 'Eco-Friendly',
            name: 'Toyota Camry Hybrid',
            slogan: 'Elegant and Comfortable Luxury Sedan',
            'capacity-val': '3 Passengers (with professional driver)',
            'luggage-val': '2 pieces (27 inch)',
            'tech-title': 'Toyota Safety Sense 2.0',
            desc: 'Upgraded with "Toyota Safety Sense 2.0 Intelligent Driving Assistance System", featuring up to 34 active and passive safety protection systems, providing drivers and passengers with comprehensive safety protection.',
            t1: 'AHB Intelligent High Beam Auto Switch',
            t2: 'PCS Pre-Collision System',
            t3: 'Emergency Steering Assist',
            t4: 'ACC Full-Speed Active Cruise Control',
            t5: 'LTA Lane Tracing Assist',
            t6: 'Stop & Go Function'
          },
          notice: {
            title: 'Important Notice',
            content: 'The above vehicle interiors are for reference only. Actual interiors are subject to on-site vehicles. We guarantee that every vehicle provided has undergone strict inspection to ensure safety and comfort.'
          },
          cta: {
            title: 'Book Your Exclusive Ride Now',
            subtitle: 'Professional drivers, premium vehicles, thoughtful service - making every journey a wonderful memory',
            book: 'Online Booking',
            call: 'Call Now'
          }
        },
        
        // Privacy Policy Page
        privacy: {
          title: 'Privacy Policy'
        },
        
        // Terms of Service Page
        terms: {
          title: 'Terms of Service',
          intro: 'By clicking "Agree" when booking online, you agree to comply with the "Terms of Service" and "Privacy Policy". To ensure your rights, please read the following terms of service carefully.'
        },

        // Flight Search Page
        flight: {
          title: '✈️ Flight Information Search',
          subtitle: 'Enter your flight number to quickly search flight information and book airport transfer',
          input: {
            placeholder: 'e.g., BR123, CI001, EVA001'
          },
          search: 'Search Flight',
          quickLinks: 'Quick Links:',
          tpe: 'Taoyuan Airport',
          result: {
            departure: 'Departure Time',
            arrival: 'Arrival Time',
            terminal: 'Terminal',
            airline: 'Airline'
          },
          useInfo: 'Use This Flight Info to Book Transfer',
          notice: {
            title: 'Note:',
            content: 'After finding your flight information, click the "Use This Flight Info to Book Transfer" button. The system will automatically redirect to the booking form with flight details pre-filled. You only need to provide your name, contact information, and other basic details to complete the booking.'
          }
        }
      }
    };
  }
}

// 初始化多語系系統
document.addEventListener('DOMContentLoaded', () => {
  // ========================================
  // 語言偵測設定
  // ========================================
  // 方案 1：使用瀏覽器語言偵測（推薦✨，預設）
  window.i18n = new I18nManager();
  
  // 方案 2：啟用 IP 地理位置偵測（需要取消註釋）
  // window.i18n = new I18nManager({ useIPDetection: true });
});
