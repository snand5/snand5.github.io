(() => {
  const shortformList = document.getElementById("articlesContainer");
  const tagsContainer = document.getElementById("tags");
  let allShortform = [];
  let allTags = new Set();
  let filteredShortform = [];
  let searchResults = null; // null = no search active, array = search results
  let currentPage = 1;
  const itemsPerPage = 10;

  const formatDate = dateStr => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const months = [
      "January","February","March","April","May","June","July",
      "August","September","October","November","December"
    ];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const escapeHTML = str => {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  const createShortformElement = item => {
    const article = document.createElement("div");
    article.className = "article h-entry hentry";

    // Title
    const titleDiv = document.createElement("div");
    titleDiv.className = "title";

    const link = document.createElement("a");
    link.className = "u-url u-repost-of";
    link.href = item.external_url;
    link.rel = "bookmark";
    link.target = "_blank";
    link.innerHTML = `"<span class="p-name">${escapeHTML(item.title)}</span>"`;
    titleDiv.appendChild(link);
    titleDiv.append(".");
    article.appendChild(titleDiv);

    // Byline
    if (item.author || item.publication) {
      const byline = document.createElement("div");
      byline.className = "byline";
      const author = item.author
        ? `<span class="p-author h-card">${escapeHTML(item.author)}</span>`
        : "";
      const pub = item.publication
        ? ` in <i class="p-publication">${escapeHTML(item.publication)}</i>.`
        : ".";
      byline.innerHTML = `${author}${pub}`;
      article.appendChild(byline);
    }

    // Details (dates)
    const details = document.createElement("div");
    details.className = "details";
    const published = formatDate(item.date);
    const accessed = formatDate(item.accessed || item.date);
    details.innerHTML = `
      <span class="read-date">
        Published <time class="dt-published published" datetime="${item.date}">${published}</time>.
        Read on <time class="dt-accessed accessed" datetime="${item.accessed || item.date}">${accessed}</time>.
      </span>
    `;
    article.appendChild(details);

    // Summary / content
    if (item.content) {
      const summary = document.createElement("div");
      summary.className = "summary p-summary entry-summary";
      summary.innerHTML = item.content;
      article.appendChild(summary);
    }

    // Tags
    if (item.tags && item.tags.length) {
      const tagsOuter = document.createElement("div");
      tagsOuter.className = "tags";
      const tagsInner = document.createElement("span");
      tagsInner.className = "tags";
      tagsInner.innerHTML = item.tags
        .map(t => `<span class="p-category">${escapeHTML(t)}</span>`)
        .join(", ");
      tagsOuter.appendChild(tagsInner);
      article.appendChild(tagsOuter);
    }

    return article;
  };

  // --- Load and render logic ---
  const loadShortform = () => {
    showLoading();
    const script = document.querySelector("script[data-json]");
    const dataUrl = script ? script.dataset.json : "/shortform.json";
    fetch(dataUrl)
      .then(res => (res.ok ? res.json() : Promise.reject("Failed to load")))
      .then(items => {
        allShortform = items;
        items.forEach(item => item.tags?.forEach(t => allTags.add(t)));
        populateTagFilters();
        setupEventListeners();
        initializeSearch(dataUrl);
        filterShortform();
      })
      .catch(() =>
        showError("Failed to load shortform reading list. Please refresh the page.")
      );
  };

  const populateTagFilters = () => {
    Array.from(allTags)
      .sort()
      .forEach(tag => {
        const count = allShortform.filter(item => item.tags?.includes(tag)).length;

        const div = document.createElement("div");
        div.className = "button-group";

        const button = document.createElement("button");
        button.className = "tag category-tag";
        button.dataset.tag = tag;
        button.type = "button";
        button.setAttribute("aria-pressed", "false");
        button.textContent = tag;

        const span = document.createElement("span");
        span.className = "tag-count";
        span.textContent = `(${count})`;

        div.appendChild(button);
        div.appendChild(span);
        tagsContainer.appendChild(div);
      });
  };

  const getSelectedTags = containerId => {
    const buttons = document.querySelectorAll(
      `#${containerId} button[aria-pressed="true"]`
    );
    return Array.from(buttons).map(btn => btn.dataset.tag);
  };

  const filterShortform = () => {
    const selectedTags = getSelectedTags("tags");
    const sortOrder = document.getElementById("sort-order")?.value || "newest";

    // Start with either search results or all items
    const baseItems = searchResults !== null ? searchResults : allShortform;

    filteredShortform = baseItems.filter(item => {
      return !selectedTags.length || item.tags?.some(t => selectedTags.includes(t));
    });

    filteredShortform.sort((a, b) => {
      const dateA = new Date(a.accessed || a.date);
      const dateB = new Date(b.accessed || b.date);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    currentPage = 1;
    renderCurrentPage();
  };

  const renderCurrentPage = () => {
    const totalPages = Math.ceil(filteredShortform.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    renderShortform(filteredShortform.slice(startIndex, endIndex));
    renderPagination(totalPages);
    updateShortformCount(filteredShortform.length, allShortform.length);
  };

  const renderShortform = items => {
    shortformList.innerHTML = "";
    if (!items.length) {
      const div = document.createElement("div");
      div.style.cssText =
        "padding: 2rem; text-align: center; color: var(--secondary-text-color);";
      div.textContent = searchResults !== null
        ? "No items match your search and filters."
        : "No items match the selected filters.";
      shortformList.appendChild(div);
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(item => frag.appendChild(createShortformElement(item)));
    shortformList.appendChild(frag);
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
      btn.addEventListener("click", () => {
        currentPage = i;
        renderCurrentPage();
      });
      paginator.appendChild(btn);
    }
  };

  const updateShortformCount = (visible, total) => {
    const el = document.getElementById("shortform-count");
    if (el) {
      const searchText = searchResults !== null
        ? ` (${searchResults.length} match search)`
        : "";
      el.textContent = `${visible} results matching these filters${searchText} out of ${total} total results.`;
    }
  };

  const showLoading = () =>
    (shortformList.innerHTML =
      '<div style="padding: 2rem; text-align: center; color: var(--secondary-text-color);">Loading shortform...</div>');

  const showError = msg =>
    (shortformList.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--accent-color-purple);">${escapeHTML(
      msg
    )}</div>`);

  const setupEventListeners = () => {
    document.querySelectorAll("#tags button").forEach(btn => {
      btn.addEventListener("click", () => {
        const pressed = btn.getAttribute("aria-pressed") === "true" ? "false" : "true";
        btn.setAttribute("aria-pressed", pressed);
        filterShortform();
      });
    });

    document.getElementById("sort-order")?.addEventListener("change", filterShortform);

    document.getElementById("clear-filters")?.addEventListener("click", () => {
      document
        .querySelectorAll("#tags button")
        .forEach(btn => btn.setAttribute("aria-pressed", "false"));
      document.getElementById("sort-order").value = "newest";
      filterShortform();
    });
  };

  const initializeSearch = (dataUrl) => {
    const searchInput = document.getElementById("search-input");
    if (!searchInput || !window.ShortformSearch) return;

    new window.ShortformSearch({
      input: searchInput,
      dataUrl: dataUrl,
      onSearch: (results, query) => {
        searchResults = results;
        filterShortform();
      },
      onClear: () => {
        searchResults = null;
        filterShortform();
      }
    });
  };

  if (shortformList) loadShortform();
})();