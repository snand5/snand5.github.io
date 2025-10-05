(function () {
    // Utility functions
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/…/g, '&hellip;');
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }

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

    // Strip HTML tags from content
    function stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    function highlightMatches(text, matches) {
        if (!matches || matches.length === 0) return escapeHTML(text);
        matches.sort((a, b) => a.start - b.start);
        let lastIndex = 0;
        let result = '';
        matches.forEach(m => {
            result += escapeHTML(text.slice(lastIndex, m.start));
            result += `<mark>${escapeHTML(text.slice(m.start, m.end))}</mark>`;
            lastIndex = m.end;
        });
        result += escapeHTML(text.slice(lastIndex));
        return result;
    }

    // Get preview text around the first match
    function getPreview(text, matches, maxLength = 140) {
        if (!matches || matches.length === 0) {
            return escapeHTML(text.slice(0, maxLength) + (text.length > maxLength ? '...' : ''));
        }

        const firstMatch = matches[0];
        const contextLength = Math.floor((maxLength - (firstMatch.end - firstMatch.start)) / 2);
        
        let start = Math.max(0, firstMatch.start - contextLength);
        let end = Math.min(text.length, firstMatch.end + contextLength);
        
        // Adjust to not cut words
        if (start > 0) {
            const spaceIndex = text.lastIndexOf(' ', start);
            if (spaceIndex > 0 && start - spaceIndex < 20) start = spaceIndex + 1;
        }
        if (end < text.length) {
            const spaceIndex = text.indexOf(' ', end);
            if (spaceIndex > 0 && spaceIndex - end < 20) end = spaceIndex;
        }

        const preview = text.slice(start, end);
        const prefix = start > 0 ? '...' : '';
        const suffix = end < text.length ? '...' : '';
        
        // Adjust match positions for the sliced preview
        const adjustedMatches = matches
            .filter(m => m.start < end && m.end > start)
            .map(m => ({
                start: Math.max(0, m.start - start),
                end: Math.min(preview.length, m.end - start)
            }));

        return prefix + highlightMatches(preview, adjustedMatches) + suffix;
    }

    // Main Search class
    function Search({ form, input, list, resultTitle, resultTitleTemplate, dataUrl }) {
        this.form = form;
        this.input = input;
        this.list = list;
        this.resultTitle = resultTitle;
        this.resultTitleTemplate = resultTitleTemplate;
        this.data = null;
        this.lastSearch = '';
        this.dataUrl = dataUrl;
        this.isLoading = false;

        this.loadData().then(() => {
            this.init();
        }).catch(err => {
            console.error('Failed to load search data:', err);
            this.showError('Failed to load search data. Please refresh the page.');
        });
    }

    Search.prototype.loadData = function () {
        this.isLoading = true;
        this.showLoading();
        return fetch(this.dataUrl)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(json => {
                this.data = json.map(item => {
                    // Strip HTML from content for searching
                    item.content = stripHTML(item.content || '');
                    item.searchableContent = (item.title + ' ' + item.content).toLowerCase();
                    return item;
                });
                this.isLoading = false;
                this.clear();
            });
    };

    Search.prototype.init = function () {
        const self = this;

        // Add aria-live region for screen readers
        this.list.setAttribute('aria-live', 'polite');
        this.list.setAttribute('role', 'region');
        this.list.setAttribute('aria-label', 'Search results');

        // Check URL query string
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('keyword')) {
            this.input.value = urlParams.get('keyword');
            this.doSearch(this.input.value.trim());
        }

        // Input handler with debouncing
        const debouncedSearch = debounce(function(value) {
            const keywords = value.trim();
            if (keywords === '') {
                self.clear();
                self.updateQueryString('');
                return;
            }
            if (keywords === self.lastSearch) return;
            self.lastSearch = keywords;
            self.doSearch(keywords);
            self.updateQueryString(keywords);
        }, 300);

        this.input.addEventListener('input', function () {
            debouncedSearch(this.value);
        });

        // Form submit
        this.form.addEventListener('submit', function (e) {
            e.preventDefault();
            const keywords = self.input.value.trim();
            if (keywords) {
                self.lastSearch = keywords;
                self.doSearch(keywords);
            }
        });

        // Back/forward navigation
        window.addEventListener('popstate', function () {
            const params = new URLSearchParams(window.location.search);
            const keywords = params.get('keyword') || '';
            self.input.value = keywords;
            if (keywords) self.doSearch(keywords);
            else self.clear();
        });
    };

    Search.prototype.doSearch = function (query) {
        if (this.isLoading) return;

        const startTime = performance.now();
        const keywords = query.trim().split(/\s+/).filter(k => k.length > 0);
        
        if (keywords.length === 0) {
            this.clear();
            return;
        }

        // Create regex for each keyword
        const regexes = keywords.map(k => new RegExp(escapeRegExp(k), 'gi'));

        const results = this.data
            .map(item => {
                // Check if ALL keywords are present (AND logic)
                const hasAllKeywords = keywords.every(keyword => 
                    item.searchableContent.includes(keyword.toLowerCase())
                );

                if (!hasAllKeywords) return null;

                // Find matches for highlighting
                const titleMatches = [];
                const contentMatches = [];
                
                regexes.forEach(regex => {
                    regex.lastIndex = 0; // Reset regex
                    [...(item.title || '').matchAll(regex)].forEach(m => {
                        titleMatches.push({ start: m.index, end: m.index + m[0].length });
                    });
                    regex.lastIndex = 0;
                    [...(item.content || '').matchAll(regex)].forEach(m => {
                        contentMatches.push({ start: m.index, end: m.index + m[0].length });
                    });
                });

                // Calculate score: title matches worth more
                const titleScore = titleMatches.length * 10;
                const contentScore = contentMatches.length;
                const totalScore = titleScore + contentScore;

                return {
                    title: highlightMatches(item.title, titleMatches),
                    preview: contentMatches.length > 0 
                        ? getPreview(item.content, contentMatches, 140) 
                        : escapeHTML(item.content.slice(0, 140) + (item.content.length > 140 ? '...' : '')),
                    permalink: item.permalink,
                    image: item.image || null,
                    score: totalScore,
                    date: item.date
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);

        this.renderResults(results);

        const endTime = performance.now();
        const timeText = this.resultTitleTemplate
            .replace('#PAGES_COUNT', results.length)
            .replace('#TIME_SECONDS', ((endTime - startTime) / 1000).toFixed(2));
        
        this.resultTitle.innerText = timeText;
        
        // Announce to screen readers
        const announcement = results.length === 0 
            ? 'No results found' 
            : `Found ${results.length} result${results.length === 1 ? '' : 's'}`;
        this.resultTitle.setAttribute('aria-label', announcement);
    };

    Search.prototype.renderResults = function (results) {
        this.list.innerHTML = '';
        
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.style.cssText = 'padding: 2rem; text-align: center; color: var(--secondary-text-color);';
            noResults.innerHTML = '<p>No results found. Try different keywords.</p>';
            this.list.appendChild(noResults);
            return;
        }

        const frag = document.createDocumentFragment();
        results.forEach((item, index) => {
            const article = document.createElement('article');
            const link = document.createElement('a');
            link.href = item.permalink;
            link.setAttribute('aria-label', `Search result ${index + 1}: ${stripHTML(item.title)}`);

            const details = document.createElement('div');
            details.className = 'article-details';
            details.innerHTML = `<h2 class="article-title">${item.title}</h2>
                                 <section class="article-preview">${item.preview}</section>`;
            link.appendChild(details);

            if (item.image) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'article-image';
                imgDiv.innerHTML = `<img src="${escapeHTML(item.image)}" loading="lazy" alt="">`;
                link.appendChild(imgDiv);
            }

            article.appendChild(link);
            frag.appendChild(article);
        });
        this.list.appendChild(frag);
    };

    Search.prototype.clear = function () {
        this.list.innerHTML = '';
        this.resultTitle.innerText = '';
        this.resultTitle.removeAttribute('aria-label');
    };

    Search.prototype.showLoading = function () {
        this.list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--secondary-text-color);">Loading search data...</div>';
    };

    Search.prototype.showError = function (message) {
        this.list.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--accent-color-purple);">${escapeHTML(message)}</div>`;
    };

    Search.prototype.updateQueryString = function (keywords) {
        const url = new URL(window.location.href);
        if (!keywords) url.searchParams.delete('keyword');
        else url.searchParams.set('keyword', keywords);
        window.history.replaceState({}, '', url.toString());
    };

    // Initialize search
    window.addEventListener('load', function () {
        const form = document.querySelector('.search-form');
        if (!form) return;
        new Search({
            form: form,
            input: form.querySelector('input[name="keyword"]'),
            list: document.querySelector('.search-result--list'),
            resultTitle: document.querySelector('.search-result--title'),
            resultTitleTemplate: window.searchResultTitleTemplate,
            dataUrl: form.dataset.json
        });
    });
})();