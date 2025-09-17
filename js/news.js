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
    
    this.init();
  }

  async init() {
    try {
      await this.loadNewsData();
      this.renderCategories();
      this.filterNews();
      this.renderNews();
      this.renderPagination();
      this.bindEvents();
    } catch (error) {
      console.error('初始化新聞系統失敗:', error);
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
    if (!filterContainer || !this.newsData.settings.showCategories) return;

    const categories = this.newsData.categories;
    
    filterContainer.innerHTML = categories.map(category => `
      <button class="news-filter-btn ${category.active ? 'active' : ''}" 
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

    if (newsToShow.length === 0) {
      newsContainer.innerHTML = `
        <div class="no-news">
          <p>目前沒有相關消息</p>
        </div>
      `;
      return;
    }

    newsContainer.innerHTML = newsToShow.map(news => `
      <article class="news-item ${news.featured ? 'featured' : ''}">
        ${news.image && this.newsData.settings.showImages ? `
          <div class="news-image">
            <img src="${news.image}" alt="${news.title}" loading="lazy">
          </div>
        ` : ''}
        <div class="news-content">
          <div class="news-meta">
            <span class="news-date">${this.formatDate(news.date)}</span>
            <span class="news-category">${this.getCategoryName(news.category)}</span>
          </div>
          <h3 class="news-title">${news.title}</h3>
          <p class="news-summary">${news.summary}</p>
          <button class="news-read-more" data-news-id="${news.id}">
            閱讀更多 <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </article>
    `).join('');
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

    // 建立彈出視窗
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
      <div class="news-modal-content">
        <div class="news-modal-header">
          <h2>${news.title}</h2>
          <button class="news-modal-close">&times;</button>
        </div>
        <div class="news-modal-body">
          <div class="news-modal-meta">
            <span class="news-date">${this.formatDate(news.date)}</span>
            <span class="news-category">${this.getCategoryName(news.category)}</span>
          </div>
          ${news.image ? `<img src="${news.image}" alt="${news.title}" class="news-modal-image">` : ''}
          <div class="news-modal-text">
            ${news.content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
          </div>
        </div>
        <div class="news-modal-footer">
          <button class="btn btn-primary news-modal-contact" onclick="window.location.href='聯絡我們.html'">
            聯絡我們
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 綁定關閉事件
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('news-modal-close')) {
        document.body.removeChild(modal);
      }
    });

    // 阻止背景滾動
    document.body.style.overflow = 'hidden';
    
    // 關閉時恢復滾動
    modal.addEventListener('remove', () => {
      document.body.style.overflow = '';
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  getCategoryName(categoryId) {
    const category = this.newsData.categories.find(cat => cat.id === categoryId);
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