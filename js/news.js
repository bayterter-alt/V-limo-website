/**
 * 新聞管理系統
 * 透過 news.json 檔案管理最新消息
 */

class NewsManager {
  constructor() {
    this.newsData = null;
    this.currentPage = 1;
    this.currentCategory = 'all';
    this.filteredNews = [];
    this.currentLang = 'zh-TW'; // 預設語言
    
    this.init();
  }
  
  // 獲取當前語言
  getCurrentLanguage() {
    // 從 localStorage 或 window.i18n 獲取當前語言
    if (window.i18n && window.i18n.currentLang) {
      return window.i18n.currentLang;
    }
    return localStorage.getItem('lang') || 'zh-TW';
  }
  
  // 更新語言並重新渲染
  updateLanguage(lang) {
    this.currentLang = lang;
    this.renderCategories();
    this.renderNews();
  }

  async init() {
    try {
      this.currentLang = this.getCurrentLanguage(); // 獲取當前語言
      console.log('📰 新聞系統初始化中... 當前語言:', this.currentLang);
      
      await this.loadNewsData();
      console.log('✅ 新聞資料載入成功');
      
      this.renderCategories();
      this.filterNews();
      this.renderNews();
      this.renderPagination();
      this.bindEvents();
      
      console.log('✅ 新聞系統初始化完成');
      
      // 監聽語言切換事件
      window.addEventListener('languageChanged', (e) => {
        this.updateLanguage(e.detail.lang);
        this.filterNews();
        this.renderNews();
        this.renderPagination();
      });
    } catch (error) {
      console.error('❌ 初始化新聞系統失敗:', error);
      this.showError();
    }
  }

  async loadNewsData() {
    try {
      const response = await fetch('./news.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.newsData = await response.json();
    } catch (error) {
      console.error('載入新聞資料失敗:', error);
      throw error;
    }
  }

  renderCategories() {
    const filterContainer = document.getElementById('news-filter');
    if (!filterContainer) return;
    
    // 防護性檢查
    if (!this.newsData || !this.newsData.categories || !this.newsData.settings) {
      console.warn('新聞資料尚未載入或格式不正確');
      return;
    }
    
    if (!this.newsData.settings.showCategories) return;

    // 根據當前語言獲取分類
    const categories = this.newsData.categories[this.currentLang] || this.newsData.categories['zh-TW'];
    
    // 確保 categories 是陣列
    if (!Array.isArray(categories)) {
      console.error('分類資料格式錯誤，應為陣列:', categories);
      return;
    }
    
    filterContainer.innerHTML = categories.map(category => `
      <button class="news-filter-btn ${category.id === this.currentCategory ? 'active' : ''}" 
              data-category="${category.id}">
        ${category.name}
      </button>
    `).join('');
  }

  filterNews() {
    let news = [...this.newsData.news];
    
    // 依分類篩選
    if (this.currentCategory !== 'all') {
      news = news.filter(item => item.category === this.currentCategory);
    }
    
    // 依日期排序（最新在前）
    news.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    this.filteredNews = news;
    this.currentPage = 1; // 重置頁面
  }

  renderNews() {
    const newsContainer = document.getElementById('news-list');
    if (!newsContainer) return;

    const itemsPerPage = this.newsData.settings.itemsPerPage;
    const startIndex = (this.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newsToShow = this.filteredNews.slice(startIndex, endIndex);

    // 多語言文字
    const noNewsText = this.currentLang === 'en' ? 'No related news available' : '目前沒有相關消息';
    const readMoreText = this.currentLang === 'en' ? 'Read More' : '閱讀更多';

    if (newsToShow.length === 0) {
      newsContainer.innerHTML = `
        <div class="no-news">
          <p>${noNewsText}</p>
        </div>
      `;
      return;
    }

    newsContainer.innerHTML = newsToShow.map(news => {
      // 根據當前語言獲取內容
      const title = typeof news.title === 'object' ? (news.title[this.currentLang] || news.title['zh-TW']) : news.title;
      const summary = typeof news.summary === 'object' ? (news.summary[this.currentLang] || news.summary['zh-TW']) : news.summary;
      
      return `
        <article class="news-item ${news.featured ? 'featured' : ''}">
          ${news.image && this.newsData.settings.showImages ? `
            <div class="news-image">
              <img src="${news.image}" alt="${title}" loading="lazy">
            </div>
          ` : ''}
          <div class="news-content">
            <div class="news-meta">
              <span class="news-date">${this.formatDate(news.date)}</span>
              <span class="news-category">${this.getCategoryName(news.category)}</span>
            </div>
            <h3 class="news-title">${title}</h3>
            <p class="news-summary">${summary}</p>
            <button class="news-read-more" data-news-id="${news.id}">
              ${readMoreText} <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  renderPagination() {
    const paginationContainer = document.getElementById('news-pagination');
    if (!paginationContainer || !this.newsData.settings.showPagination) return;

    const itemsPerPage = this.newsData.settings.itemsPerPage;
    const totalPages = Math.ceil(this.filteredNews.length / itemsPerPage);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let paginationHTML = '';
    
    // 上一頁按鈕
    if (this.currentPage > 1) {
      paginationHTML += `
        <button class="pagination-btn" data-page="${this.currentPage - 1}">
          <i class="fas fa-chevron-left"></i> 上一頁
        </button>
      `;
    }

    // 頁碼按鈕
    for (let i = 1; i <= totalPages; i++) {
      if (i === this.currentPage) {
        paginationHTML += `<button class="pagination-btn active">${i}</button>`;
      } else {
        paginationHTML += `<button class="pagination-btn" data-page="${i}">${i}</button>`;
      }
    }

    // 下一頁按鈕
    if (this.currentPage < totalPages) {
      paginationHTML += `
        <button class="pagination-btn" data-page="${this.currentPage + 1}">
          下一頁 <i class="fas fa-chevron-right"></i>
        </button>
      `;
    }

    paginationContainer.innerHTML = paginationHTML;
  }

  bindEvents() {
    // 分類篩選事件
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('news-filter-btn')) {
        const category = e.target.dataset.category;
        this.changeCategory(category);
      }
    });

    // 分頁事件
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pagination-btn') && e.target.dataset.page) {
        const page = parseInt(e.target.dataset.page);
        this.changePage(page);
      }
    });

    // 閱讀更多事件
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('news-read-more')) {
        const newsId = parseInt(e.target.dataset.newsId);
        this.showNewsDetail(newsId);
      }
    });
  }

  changeCategory(category) {
    this.currentCategory = category;
    
    // 更新分類按鈕狀態
    document.querySelectorAll('.news-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    this.filterNews();
    this.renderNews();
    this.renderPagination();
  }

  changePage(page) {
    this.currentPage = page;
    this.renderNews();
    this.renderPagination();
    
    // 滾動到新聞區塊
    document.getElementById('news-section').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }

  showNewsDetail(newsId) {
    const news = this.newsData.news.find(item => item.id === newsId);
    if (!news) return;

    // 根據當前語言獲取內容
    const title = typeof news.title === 'object' ? (news.title[this.currentLang] || news.title['zh-TW']) : news.title;
    const content = typeof news.content === 'object' ? (news.content[this.currentLang] || news.content['zh-TW']) : news.content;
    
    // 多語言按鈕文字
    const contactUsText = this.currentLang === 'en' ? 'Contact Us' : '聯絡我們';
    const closeAriaLabel = this.currentLang === 'en' ? 'Close news window' : '關閉消息視窗';

    // 建立彈出視窗
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
      <div class="news-modal-content">
        <div class="news-modal-header">
          <h2>${title}</h2>
          <button class="news-modal-close" aria-label="${closeAriaLabel}">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="news-modal-body">
          <div class="news-modal-meta">
            <span class="news-date">${this.formatDate(news.date)}</span>
            <span class="news-category">${this.getCategoryName(news.category)}</span>
          </div>
          ${news.image ? `<img src="${news.image}" alt="${title}" class="news-modal-image">` : ''}
          <div class="news-modal-text">
            ${content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
          </div>
        </div>
        <div class="news-modal-footer">
          <button class="btn btn-primary news-modal-contact" onclick="window.location.href='聯絡我們.html'">
            ${contactUsText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 獲取當前真實的滾動位置（在添加 modal 之後，修改 body 之前）
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // 保存原始樣式（只保存非空值）
    const originalStyles = {
      overflow: document.body.style.overflow || '',
      position: document.body.style.position || '',
      top: document.body.style.top || '',
      left: document.body.style.left || '',
      right: document.body.style.right || '',
      width: document.body.style.width || ''
    };
    
    // 阻止背景滾動（行動裝置優化）
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    
    // 防止移動設備上的觸摸滾動
    document.body.style.touchAction = 'none';
    document.documentElement.style.touchAction = 'none';

    // 清理標記
    let isClosing = false;
    let escapeHandler = null;

    // 關閉模態視窗的函數
    const closeModal = () => {
      // 防止重複關閉
      if (isClosing) return;
      isClosing = true;

      // 移除 ESC 鍵監聽器
      if (escapeHandler) {
        document.removeEventListener('keydown', escapeHandler);
        escapeHandler = null;
      }

      // 開始關閉動畫
      modal.classList.add('closing');
      
      // 強化的滾動恢復機制（特別為移動設備優化）
      const html = document.documentElement;
      const body = document.body;
      
      // 1. 暫時禁用平滑滾動
      const originalScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      body.style.scrollBehavior = 'auto';
      
      // 2. 完全移除所有鎖定樣式（使用 removeProperty 更徹底）
      body.style.removeProperty('overflow');
      body.style.removeProperty('position');
      body.style.removeProperty('top');
      body.style.removeProperty('left');
      body.style.removeProperty('right');
      body.style.removeProperty('width');
      
      // 3. 強制重新計算樣式（移動設備關鍵）
      void body.offsetHeight;
      
      // 4. 多重方式恢復滾動位置
      html.scrollTop = scrollY;
      body.scrollTop = scrollY;
      window.scrollTo(0, scrollY);
      
      // 5. 確保觸摸事件正常（移動設備）
      body.style.touchAction = '';
      html.style.touchAction = '';
      
      // 6. 延遲恢復平滑滾動
      setTimeout(() => {
        html.style.scrollBehavior = originalScrollBehavior || '';
        body.style.scrollBehavior = '';
      }, 100);
      
      // 7. 移除 DOM
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }, 200);
    };

    // 綁定關閉按鈕事件
    const closeBtn = modal.querySelector('.news-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // ESC 鍵關閉
    escapeHandler = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeModal();
      }
    };
    document.addEventListener('keydown', escapeHandler);

    // 添加開啟動畫
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  getCategoryName(categoryId) {
    const categories = this.newsData.categories[this.currentLang] || this.newsData.categories['zh-TW'];
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  }

  showError() {
    const newsContainer = document.getElementById('news-list');
    if (newsContainer) {
      newsContainer.innerHTML = `
        <div class="news-error">
          <p>載入新聞資料時發生錯誤，請稍後再試。</p>
        </div>
      `;
    }
  }
}

// 當 DOM 載入完成後初始化新聞系統
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('news-section')) {
    new NewsManager();
  }
});