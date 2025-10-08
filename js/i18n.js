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
        console.warn(`Translation key not found: ${key}`);
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
          address: '公司地址',
          'address.detail': '台中市豐原區豐原大道七段66號'
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
            hsinchu: '新竹竹東取車點：',
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
            service: '服務類型',
            'service.placeholder': '請選擇服務類型',
            'service.airport': '機場接送',
            'service.tour': '旅遊包車',
            'service.rv': '露營車出租',
            'service.truck': '貨車出租',
            'service.other': '其他諮詢',
            subject: '主旨',
            message: '訊息內容',
            'message.placeholder': '請詳細描述您的需求，包含日期、時間、地點等資訊',
            submit: '確認送出'
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
          address: 'Address',
          'address.detail': 'No. 66, Sec. 7, Fengyuan Ave., Fengyuan Dist., Taichung City'
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
          subtitle: 'Whether for business travel, family trips, or cargo transport, V-LIMO provides the perfect solution for you.'
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
          desc: 'V-LIMO provides comprehensive car services including rental, point-to-point transfer, and charter tours. As your transportation expert, we are committed to making every journey safer, more comfortable, and more convenient.',
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
          subtitle: 'Stay updated with V-LIMO\'s latest information, promotions, and service announcements.'
        },

        // Footer
        footer: {
          company: 'V-LIMO Car Rental Co., Ltd.',
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
          copyright: 'Copyright © V-LIMO Car Rental Co., Ltd.',
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
            hsinchu: 'Hsinchu Zhudong Pickup:',
            search: 'Google Maps Search: V-LIMO Car/Truck/Rutrip Rental Pickup Point'
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
            service: 'Service Type',
            'service.placeholder': 'Please select service type',
            'service.airport': 'Airport Transfer',
            'service.tour': 'Charter Service',
            'service.rv': 'RV Rental',
            'service.truck': 'Truck Rental',
            'service.other': 'Other Inquiry',
            subject: 'Subject',
            message: 'Message',
            'message.placeholder': 'Please describe your needs in detail, including date, time, location, etc.',
            submit: 'Submit'
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
