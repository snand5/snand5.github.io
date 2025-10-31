(() => {

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // -------------------------------
  // Reading Search (books)
  // -------------------------------
  class ReadingSearch {
    constructor({ input, dataUrl, onSearch, onClear }) {
      this.input = input;
      this.dataUrl = dataUrl;
      this.onSearch = onSearch;
      this.onClear = onClear;
      this.data = null;
      this.isLoading = false;
      
      this.loadData().then(() => {
        this.init();
      }).catch(err => {
        console.error('Failed to load reading search data:', err);
      });
    }

    loadData() {
      this.isLoading = true;
      return fetch(this.dataUrl)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(json => {
          this.data = json.map(book => {
            const searchFields = [
              book.title,
              book.subtitle,
              book.author,
              book.series,
              ...(book.genre || [])
            ].filter(Boolean).join(' ').toLowerCase();
            
            return { ...book, searchableContent: searchFields };
          });
          this.isLoading = false;
        });
    }

    init() {
      const self = this;
      const debouncedSearch = debounce(function(value) {
        const keywords = value.trim();

        // Update URL
        const params = new URLSearchParams(window.location.search);
        if (keywords) {
          params.set('search', keywords);
        } else {
          params.delete('search');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);

        if (keywords === '') {
          self.onClear();
          return;
        }
        self.doSearch(keywords);
      }, 300);

      this.input.addEventListener('input', function() {
        debouncedSearch(this.value);
      });

      this.input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          this.value = '';
          self.onClear();
          const params = new URLSearchParams(window.location.search);
          params.delete('search');
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState({}, '', newUrl);
        }
      });

      // Load search from URL on page load
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('search')) {
        const searchValue = urlParams.get('search');
        this.input.value = searchValue;
        this.doSearch(searchValue.trim());
      }
    }

    doSearch(query) {
      if (this.isLoading || !this.data) return;

      const keywords = query.trim().split(/\s+/).filter(k => k.length > 0);
      if (keywords.length === 0) {
        this.onClear();
        return;
      }

      const results = this.data.filter(book => 
        keywords.every(keyword => book.searchableContent.includes(keyword.toLowerCase()))
      );

      this.onSearch(results, query);
    }
  }

  // -------------------------------
  // Shortform Search
  // -------------------------------
  class ShortformSearch {
    constructor({ input, dataUrl, onSearch, onClear }) {
      this.input = input;
      this.dataUrl = dataUrl;
      this.onSearch = onSearch;
      this.onClear = onClear;
      this.data = null;
      this.isLoading = false;
      
      this.loadData().then(() => {
        this.init();
      }).catch(err => {
        console.error('Failed to load shortform search data:', err);
      });
    }

    loadData() {
      this.isLoading = true;
      return fetch(this.dataUrl)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(json => {
          this.data = json.map(item => {
            const searchFields = [
              item.title,
              item.author,
              item.publication,
              item.content,
              ...(item.tags || [])
            ].filter(Boolean).join(' ').toLowerCase();
            
            return { ...item, searchableContent: searchFields };
          });
          this.isLoading = false;
        });
    }

    init() {
      const self = this;
      const debouncedSearch = debounce(function(value) {
        const keywords = value.trim();

        // Update URL
        const params = new URLSearchParams(window.location.search);
        if (keywords) {
          params.set('search', keywords);
        } else {
          params.delete('search');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);

        if (keywords === '') {
          self.onClear();
          return;
        }
        self.doSearch(keywords);
      }, 300);

      this.input.addEventListener('input', function() {
        debouncedSearch(this.value);
      });

      this.input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          this.value = '';
          self.onClear();
          const params = new URLSearchParams(window.location.search);
          params.delete('search');
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState({}, '', newUrl);
        }
      });

      // Load search from URL on page load
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('search')) {
        const searchValue = urlParams.get('search');
        this.input.value = searchValue;
        this.doSearch(searchValue.trim());
      }
    }

    doSearch(query) {
      if (this.isLoading || !this.data) return;

      const keywords = query.trim().split(/\s+/).filter(k => k.length > 0);
      if (keywords.length === 0) {
        this.onClear();
        return;
      }

      const results = this.data.filter(item =>
        keywords.every(keyword => item.searchableContent.includes(keyword.toLowerCase()))
      );

      this.onSearch(results, query);
    }
  }

  // Export to global scope
  window.ReadingSearch = ReadingSearch;
  window.ShortformSearch = ShortformSearch;
})();
