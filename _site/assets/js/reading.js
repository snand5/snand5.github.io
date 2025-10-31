(() => {
  const bookList = document.getElementById("articlesContainer");
  const tagsContainer = document.getElementById("tags");
  let allBooks = [];
  let allGenres = new Set();
  let filteredBooks = [];
  let searchResults = null; // null = no search active, array = search results
  let currentPage = 1;
  const booksPerPage = 10;

  const formatDate = dateStr => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const escapeHTML = str => {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  const createBookElement = book => {
    const li = document.createElement("div");
    li.className = "book h-entry hentry";

    const coverLink = document.createElement("a");
    coverLink.className = "book-cover-link";
    coverLink.href = book.link;

    const coverImg = document.createElement("img");
    coverImg.className = "u-photo book-cover";
    coverImg.src = book.cover;
    coverImg.alt = `Cover image of ${book.title}`;
    coverLink.appendChild(coverImg);
    li.appendChild(coverLink);

    const details = document.createElement("div");
    details.className = "book-details";

    const top = document.createElement("div");
    top.className = "top";

    if (book.series) {
      const seriesDiv = document.createElement("div");
      seriesDiv.className = "series-info";
      let seriesText = `<i>${escapeHTML(book.series)}</i> series`;
      if (book.series_number) seriesText += `, book&nbsp;<span class="series-number">${escapeHTML(book.series_number)}</span>`;
      seriesText += ".";
      seriesDiv.innerHTML = seriesText;
      top.appendChild(seriesDiv);
    }

    const titleByline = document.createElement("div");
    titleByline.className = "title-and-byline";

    const titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.innerHTML = `<i class="p-name">${escapeHTML(book.title)}</i><div class="subtitle"><i>${escapeHTML(book.subtitle)}</i></div>`;
    titleByline.appendChild(titleDiv);

    const bylineDiv = document.createElement("div");
    bylineDiv.className = "byline";
    bylineDiv.innerHTML = `by <span class="p-author h-card">${escapeHTML(book.author)}</span>. ${book.audio ? '<div class="format">Audiobook.</div>' : ""}`;
    titleByline.appendChild(bylineDiv);
    top.appendChild(titleByline);

    const bookInfo = document.createElement("div");
    bookInfo.className = "book-info";
    bookInfo.innerHTML = `Published <time class="dt-published published" datetime="${book.published}">${formatDate(book.published)}</time>. ${book.pages ? book.pages + " pages." : ""}`;
    top.appendChild(bookInfo);

    if (book.genre?.length) {
      const tagsDiv = document.createElement("div");
      tagsDiv.className = "tags";
      tagsDiv.innerHTML = book.genre.map(g => `<span class="p-category">${escapeHTML(g)}</span>`).join(", ");
      top.appendChild(tagsDiv);
    }

    details.appendChild(top);

    const bottom = document.createElement("div");
    bottom.className = "bottom";

    const readingInfo = document.createElement("div");
    readingInfo.className = "reading-info";

    if (book.started) {
      const readingDates = document.createElement("div");
      readingDates.className = "reading-dates";
      readingDates.innerHTML = `Started <time class="dt-accessed accessed" datetime="${book.started}">${formatDate(book.started)}</time>${book.completed ? "; completed " + formatDate(book.completed) : ""}.`;
      readingInfo.appendChild(readingDates);
    }

    const statusDiv = document.createElement("div");
    statusDiv.innerHTML = `<div class="p-category status">${escapeHTML(book.status).charAt(0).toUpperCase() + escapeHTML(book.status).slice(1)}</div>`;
    readingInfo.appendChild(statusDiv);

    bottom.appendChild(readingInfo);
    details.appendChild(bottom);
    li.appendChild(details);

    return li;
  };

  const loadBooks = () => {
    showLoading();
    const script = document.querySelector("script[data-json]");
    const dataUrl = script ? script.dataset.json : "/reading.json";
    fetch(dataUrl)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to load"))
      .then(books => {
        allBooks = books;
        books.forEach(book => book.genre?.forEach(g => allGenres.add(g)));
        populateGenreFilters();
        setupEventListeners();
        initializeSearch(dataUrl);
        filterBooks();
      })
      .catch(err => showError("Failed to load reading list. Please refresh the page."));
  };

  const populateGenreFilters = () => {
    Array.from(allGenres).sort().forEach(genre => {
      const count = allBooks.filter(book => book.genre?.includes(genre)).length;

      const div = document.createElement("div");
      div.className = "button-group";

      const button = document.createElement("button");
      button.className = "tag category-tag";
      button.dataset.tag = genre;
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.textContent = genre;

      const span = document.createElement("span");
      span.className = "tag-count";
      span.textContent = `(${count})`;

      div.appendChild(button);
      div.appendChild(span);
      tagsContainer.appendChild(div);
    });
  };

  const getSelectedTags = containerId => {
    const buttons = document.querySelectorAll(`#${containerId} button[aria-pressed="true"]`);
    return Array.from(buttons).map(btn => btn.dataset.tag);
  };

  const filterBooks = () => {
    const selectedGenres = getSelectedTags("tags");
    const selectedStatuses = getSelectedTags("status");
    const fictionFilter = document.getElementById("hidefiction")?.checked;
    const nonfictionFilter = document.getElementById("hidenonfiction")?.checked;
    const sortOrder = document.getElementById("sort-order")?.value || "newest";

    // Start with either search results or all books
    const baseBooks = searchResults !== null ? searchResults : allBooks;

    filteredBooks = baseBooks.filter(book => {
      const genreMatch = !selectedGenres.length || book.genre?.some(g => selectedGenres.includes(g));
      const statusMatch = !selectedStatuses.length || selectedStatuses.includes(book.status);
      const fictionMatch = (fictionFilter && !nonfictionFilter && book.fiction) || (!fictionFilter && nonfictionFilter && !book.fiction) || (!fictionFilter && !nonfictionFilter) || (fictionFilter && nonfictionFilter);
      return genreMatch && statusMatch && fictionMatch;
    });

    filteredBooks.sort((a,b) => {
      const dateA = new Date(a.started);
      const dateB = new Date(b.started);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    currentPage = 1;
    renderCurrentPage();
  };

  const renderCurrentPage = () => {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    renderBooks(filteredBooks.slice(startIndex, endIndex));
    renderPagination(totalPages);
    updateBookCount(filteredBooks.length, allBooks.length);
  };

  const renderBooks = books => {
    bookList.innerHTML = "";
    if (!books.length) {
      const div = document.createElement("div");
      div.style.cssText = "padding: 2rem; text-align: center; color: var(--secondary-text-color);";
      div.textContent = searchResults !== null 
        ? "No books match your search and filters."
        : "No books match the selected filters.";
      bookList.appendChild(div);
      return;
    }
    const frag = document.createDocumentFragment();
    books.forEach(book => frag.appendChild(createBookElement(book)));
    bookList.appendChild(frag);
  };

  const renderPagination = totalPages => {
    const paginator = document.getElementById("paginator");
    paginator.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "page-number-button";
      btn.dataset.pageNumber = i;
      btn.type = "button";
      btn.textContent = i;
      btn.setAttribute("aria-pressed", currentPage === i ? "true" : "false");
      btn.addEventListener("click", () => { currentPage = i; renderCurrentPage(); });
      paginator.appendChild(btn);
    }
  };

  const updateBookCount = (visible, total) => {
    const el = document.getElementById("book-count");
    if (el) {
      const searchText = searchResults !== null 
        ? ` (${searchResults.length} match search)` 
        : "";
      el.textContent = `${visible} results matching these filters${searchText} out of ${total} total results.`;
    }
  };

  const showLoading = () => bookList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--secondary-text-color);">Loading books...</div>';
  const showError = msg => bookList.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--accent-color-purple);">${escapeHTML(msg)}</div>`;

  const setupEventListeners = () => {
    document.querySelectorAll("#tags button, #status button").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.setAttribute("aria-pressed", btn.getAttribute("aria-pressed")==="true"?"false":"true");
        filterBooks();
      });
    });
    document.getElementById("hidefiction")?.addEventListener("change", filterBooks);
    document.getElementById("hidenonfiction")?.addEventListener("change", filterBooks);
    document.getElementById("sort-order")?.addEventListener("change", filterBooks);
    document.getElementById("clear-filters")?.addEventListener("click", () => {
      document.querySelectorAll("#tags button, #status button").forEach(btn => btn.setAttribute("aria-pressed","false"));
      document.getElementById("hidefiction").checked = true;
      document.getElementById("hidenonfiction").checked = true;
      document.getElementById("sort-order").value = "newest";
      filterBooks();
    });
  };

  const initializeSearch = (dataUrl) => {
    const searchInput = document.getElementById("search-input");
    if (!searchInput || !window.ReadingSearch) return;

    new window.ReadingSearch({
      input: searchInput,
      dataUrl: dataUrl,
      onSearch: (results, query) => {
        searchResults = results;
        filterBooks();
      },
      onClear: () => {
        searchResults = null;
        filterBooks();
      }
    });
  };

  if (bookList) loadBooks();
})();