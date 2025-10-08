/**
 * 簡易多語系系統
 * 支援中文（繁體）和英文
 */

const translations = {
  'zh-TW': {
    // 導航欄
    'nav.home': '首頁',
    'nav.booking': '線上訂車',
    'nav.truck': '貨車出租',
    'nav.rv': '露營車出租',
    'nav.contact': '聯絡我們',
    'nav.book-now': '立即預約',
    
    // Hero 區塊
    'hero.title': '專業、可靠的租賃服務',
    'hero.subtitle': '機場接送、旅遊包車、露營車與貨車出租，一次滿足您的所有用車需求。',
    'hero.cta.booking': '線上快速預約',
    'hero.cta.services': '查看服務項目',
    
    // 聯絡資訊
    'info.phone': '客服專線',
    'info.hours': '營業時間',
    'info.address': '公司地址',
    
    // USP 區塊
    'usp.reliable.title': '安心可靠',
    'usp.reliable.desc': '駕駛經驗豐富，車輛定期保養與清潔，旅程更安心。',
    'usp.fast.title': '快速預約',
    'usp.fast.desc': '線上即時下單，專人客服即刻回覆，省時又方便。',
    'usp.legal.title': '合法經營',
    'usp.legal.desc': '依法投保乘客責任險，保障您的每一趟旅程。',
    
    // 服務區塊
    'services.title': '我們的服務',
    'services.subtitle': '無論是商務差旅、家庭出遊或貨物運輸，利盟都能提供最適合您的方案。',
    'service.airport.title': '機場接送',
    'service.airport.desc': '專車接送、準時抵達，舒適免煩惱。',
    'service.airport.cta': '立即預約',
    'service.tour.title': '旅遊包車',
    'service.tour.desc': '專屬行程、彈性規劃，輕鬆玩遍全台。',
    'service.tour.cta': '線上訂車',
    'service.rv.title': '露營車出租',
    'service.rv.desc': '開著家去旅行，享受無拘無束的自由。',
    'service.rv.cta': '查看露營車',
    'service.truck.title': '貨車出租',
    'service.truck.desc': '自助搬家、貨物運輸的最佳幫手。',
    'service.truck.cta': '了解詳情',
    
    // 車型區塊
    'vehicles.title': '精選車型',
    'vehicles.subtitle': '我們提供多樣化、高品質的車輛，滿足您的不同需求。',
    'vehicles.filter.all': '全部',
    'vehicles.filter.business': '商務接送',
    'vehicles.filter.rv': '露營旅行',
    'vehicles.filter.truck': '貨物運輸',
    'vehicles.more': '更多車型介紹',
    
    // 步驟區塊
    'steps.title': '三步驟，輕鬆預約',
    'steps.subtitle': '簡單直覺的預約流程，讓您快速完成訂車，安心等待出發。',
    'step1.title': '選擇搭車的地點',
    'step1.desc': '依您的需求，挑選你想預定的地點與車輛。',
    'step2.title': '填寫預約資訊',
    'step2.desc': '輸入日期、時間、地點與聯絡方式。',
    'step3.title': '確認訂單出發',
    'step3.desc': '結帳送出訂單，平台24小時為您服務。',
    'steps.cta': '現在就預約',
    
    // 關於區塊
    'about.title': '自 1990 年起，<br>您的最佳用車夥伴',
    'about.quote': '我們始終堅持「以客為尊、服務至上」的初衷。',
    'about.desc': '利盟提供租賃、定點接送、包車旅遊等全方位用車服務。我們是您的專家，致力於讓每一段旅程更安心、舒適、便利。',
    'about.check1': '透明報價，流程清楚無隱憂',
    'about.check2': '車輛齡新，內裝乾淨又舒適',
    'about.check3': '專人服務，溝通迅速最貼心',
    
    // 客戶評價
    'testimonials.title': '客戶的聲音',
    'testimonials.subtitle': '您的滿意是我們前進的最大動力。',
    
    // FAQ
    'faq.title': '常見問答',
    
    // CTA
    'cta.title': '準備好出發了嗎？',
    'cta.subtitle': '行程規劃交給我們，您只需享受旅程。',
    'cta.consult': '線上諮詢',
    'cta.book': '立即預約',
    
    // 最新消息
    'news.title': '最新消息',
    'news.subtitle': '關注利盟租車的最新資訊、優惠活動及服務公告。',
    'news.read-more': '閱讀更多',
    
    // Footer
    'footer.contact': '聯絡我們',
    'footer.company': '利盟小客車租賃有限公司',
    'footer.phone': '電話',
    'footer.fax': '傳真',
    'footer.email': '聯絡信箱',
    'footer.hours': '營業時間',
    'footer.explore': '探索',
    'footer.support': '支援',
    'footer.quick': '快速操作',
    'footer.call': '立即來電預約',
    'footer.message': '線上留言',
    'footer.privacy': '隱私權政策',
    'footer.terms': '服務條款',
    'footer.back-top': '回到頂端',
    'footer.copyright': 'Copyright © 利盟小客車租賃有限公司',
    
    // 浮動按鈕
    'floating.call': '撥打電話',
    'floating.top': '回到頂端',
    'floating.quick-book': '一鍵快速預約'
  },
  
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.booking': 'Online Booking',
    'nav.truck': 'Truck Rental',
    'nav.rv': 'RV Rental',
    'nav.contact': 'Contact Us',
    'nav.book-now': 'Book Now',
    
    // Hero Section
    'hero.title': 'Professional & Reliable Rental Services',
    'hero.subtitle': 'Airport transfers, tour packages, RV and truck rentals - all your transportation needs in one place.',
    'hero.cta.booking': 'Quick Online Booking',
    'hero.cta.services': 'Our Services',
    
    // Contact Info
    'info.phone': 'Customer Service',
    'info.hours': 'Business Hours',
    'info.address': 'Office Address',
    
    // USP Section
    'usp.reliable.title': 'Safe & Reliable',
    'usp.reliable.desc': 'Experienced drivers, well-maintained vehicles, worry-free journeys.',
    'usp.fast.title': 'Quick Booking',
    'usp.fast.desc': 'Online instant booking, prompt customer service, convenient and time-saving.',
    'usp.legal.title': 'Licensed Operation',
    'usp.legal.desc': 'Fully insured passenger liability coverage for every journey.',
    
    // Services Section
    'services.title': 'Our Services',
    'services.subtitle': 'Whether for business travel, family outings, or cargo transport, LIMO provides the perfect solution.',
    'service.airport.title': 'Airport Transfer',
    'service.airport.desc': 'Private transfer, punctual arrival, comfortable and hassle-free.',
    'service.airport.cta': 'Book Now',
    'service.tour.title': 'Tour Packages',
    'service.tour.desc': 'Customized itineraries, flexible planning, explore Taiwan with ease.',
    'service.tour.cta': 'Book Online',
    'service.rv.title': 'RV Rental',
    'service.rv.desc': 'Travel with your home, enjoy unlimited freedom.',
    'service.rv.cta': 'View RVs',
    'service.truck.title': 'Truck Rental',
    'service.truck.desc': 'Perfect for moving and cargo transport.',
    'service.truck.cta': 'Learn More',
    
    // Vehicles Section
    'vehicles.title': 'Featured Vehicles',
    'vehicles.subtitle': 'We offer diverse, high-quality vehicles to meet your different needs.',
    'vehicles.filter.all': 'All',
    'vehicles.filter.business': 'Business',
    'vehicles.filter.rv': 'RV Travel',
    'vehicles.filter.truck': 'Cargo',
    'vehicles.more': 'More Vehicles',
    
    // Steps Section
    'steps.title': 'Easy Booking in 3 Steps',
    'steps.subtitle': 'Simple and intuitive booking process for a hassle-free experience.',
    'step1.title': 'Choose Location',
    'step1.desc': 'Select your desired pickup location and vehicle.',
    'step2.title': 'Fill Booking Details',
    'step2.desc': 'Enter date, time, location and contact information.',
    'step3.title': 'Confirm & Depart',
    'step3.desc': 'Complete payment and enjoy our 24/7 service.',
    'steps.cta': 'Book Now',
    
    // About Section
    'about.title': 'Your Best Transportation Partner<br>Since 1990',
    'about.quote': 'We always uphold our commitment to "Customer First, Service Excellence".',
    'about.desc': 'LIMO provides comprehensive transportation services including rentals, point-to-point transfers, and tour packages. We are dedicated to making every journey safer, more comfortable, and convenient.',
    'about.check1': 'Transparent pricing, clear process',
    'about.check2': 'New vehicles, clean and comfortable',
    'about.check3': 'Professional service, prompt communication',
    
    // Testimonials
    'testimonials.title': 'Customer Reviews',
    'testimonials.subtitle': 'Your satisfaction drives us forward.',
    
    // FAQ
    'faq.title': 'FAQ',
    
    // CTA
    'cta.title': 'Ready to Go?',
    'cta.subtitle': 'Let us handle the planning, you just enjoy the journey.',
    'cta.consult': 'Online Inquiry',
    'cta.book': 'Book Now',
    
    // News
    'news.title': 'Latest News',
    'news.subtitle': 'Stay updated with LIMO\'s latest information, promotions and service announcements.',
    'news.read-more': 'Read More',
    
    // Footer
    'footer.contact': 'Contact Us',
    'footer.company': 'LIMO Car Rental Co., Ltd.',
    'footer.phone': 'Phone',
    'footer.fax': 'Fax',
    'footer.email': 'Email',
    'footer.hours': 'Business Hours',
    'footer.explore': 'Explore',
    'footer.support': 'Support',
    'footer.quick': 'Quick Actions',
    'footer.call': 'Call Now',
    'footer.message': 'Online Message',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.back-top': 'Back to Top',
    'footer.copyright': 'Copyright © LIMO Car Rental Co., Ltd.',
    
    // Floating Buttons
    'floating.call': 'Call',
    'floating.top': 'Top',
    'floating.quick-book': 'Quick Booking'
  }
};

// 多語系管理器
class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.init();
  }
  
  // 偵測語言
  detectLanguage() {
    // 1. 檢查 localStorage
    const saved = localStorage.getItem('preferred-language');
    if (saved && translations[saved]) {
      return saved;
    }
    
    // 2. 檢查 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && translations[langParam]) {
      return langParam;
    }
    
    // 3. 檢查瀏覽器語言
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) {
      return 'zh-TW';
    } else if (browserLang.startsWith('en')) {
      return 'en';
    }
    
    // 4. 預設中文
    return 'zh-TW';
  }
  
  // 初始化
  init() {
    this.translate();
    this.updateLangButtons();
  }
  
  // 切換語言
  switchLanguage(lang) {
    if (!translations[lang]) {
      console.error('Language not supported:', lang);
      return;
    }
    
    this.currentLang = lang;
    localStorage.setItem('preferred-language', lang);
    this.translate();
    this.updateLangButtons();
    
    // 觸發自定義事件
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }
  
  // 翻譯頁面
  translate() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (translation) {
        // 檢查是否有 HTML 標籤
        if (translation.includes('<br>')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
    
    // 更新 HTML lang 屬性
    document.documentElement.lang = this.currentLang === 'zh-TW' ? 'zh-TW' : 'en';
  }
  
  // 獲取翻譯
  t(key) {
    return translations[this.currentLang][key] || key;
  }
  
  // 更新語言按鈕狀態
  updateLangButtons() {
    const buttons = document.querySelectorAll('[data-lang]');
    buttons.forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === this.currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

// 初始化多語系系統
let i18n;
document.addEventListener('DOMContentLoaded', () => {
  i18n = new I18n();
  
  // 綁定語言切換按鈕
  document.addEventListener('click', (e) => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
      const lang = langBtn.getAttribute('data-lang');
      i18n.switchLanguage(lang);
    }
  });
});

