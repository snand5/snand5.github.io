(function () {
  var bookList = document.getElementById("book-list");
  var allBooks = [];

  // Initialize - store all books with their original order
  function init() {
    var books = bookList.getElementsByTagName("li");
    for (var i = 0; i < books.length; i++) {
      allBooks.push({
        element: books[i],
        started: books[i].dataset.started,
        status: books[i].dataset.status,
        genres: books[i].dataset.genres
          ? books[i].dataset.genres.split(",")
          : [],
        fiction: books[i].dataset.fiction === "true",
      });
    }
  }

  // Filter and sort books
  function filterBooks() {
    var selectedGenres = getSelectedGenres();
    var selectedStatuses = getSelectedStatuses();
    var fictionFilter = document.getElementById("filter-fiction").checked;
    var nonfictionFilter = document.getElementById("filter-nonfiction").checked;
    var sortOrder = document.getElementById("sort-order").value;

    // Filter books
    var visibleBooks = allBooks.filter(function (book) {
      // Genre filter
      var genreMatch =
        selectedGenres.length === 0 ||
        selectedGenres.some(function (genre) {
          return book.genres.indexOf(genre) !== -1;
        });

      // Status filter
      var statusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.indexOf(book.status) !== -1;

      // Fiction/Non-fiction filter
      var fictionMatch = true;
      if (fictionFilter && !nonfictionFilter) {
        fictionMatch = book.fiction === true;
      } else if (!fictionFilter && nonfictionFilter) {
        fictionMatch = book.fiction === false;
      }

      return genreMatch && statusMatch && fictionMatch;
    });

    // Sort books
    visibleBooks.sort(function (a, b) {
      var dateA = new Date(a.started);
      var dateB = new Date(b.started);

      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    // Clear and repopulate list
    bookList.innerHTML = "";
    visibleBooks.forEach(function (book) {
      bookList.appendChild(book.element);
    });

    // Update count
    updateBookCount(visibleBooks.length, allBooks.length);
  }

  // Get selected genres from checkboxes
  function getSelectedGenres() {
    var genreCheckboxes = document.querySelectorAll(
      'input[name="genre"]:checked'
    );
    var genres = [];
    for (var i = 0; i < genreCheckboxes.length; i++) {
      genres.push(genreCheckboxes[i].value);
    }
    return genres;
  }

  // Get selected statuses from checkboxes
  function getSelectedStatuses() {
    var statusCheckboxes = document.querySelectorAll(
      'input[name="status"]:checked'
    );
    var statuses = [];
    for (var i = 0; i < statusCheckboxes.length; i++) {
      statuses.push(statusCheckboxes[i].value);
    }
    return statuses;
  }

  // Update book count display
  function updateBookCount(visible, total) {
    var countElement = document.getElementById("book-count");
    if (countElement) {
      countElement.textContent =
        "Showing " + visible + " of " + total + " books";
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Genre filters
    var genreCheckboxes = document.querySelectorAll('input[name="genre"]');
    for (var i = 0; i < genreCheckboxes.length; i++) {
      genreCheckboxes[i].addEventListener("change", filterBooks);
    }

    // Status filters
    var statusCheckboxes = document.querySelectorAll('input[name="status"]');
    for (var i = 0; i < statusCheckboxes.length; i++) {
      statusCheckboxes[i].addEventListener("change", filterBooks);
    }

    // Fiction/Non-fiction filters
    document
      .getElementById("filter-fiction")
      .addEventListener("change", filterBooks);
    document
      .getElementById("filter-nonfiction")
      .addEventListener("change", filterBooks);

    // Sort order
    document
      .getElementById("sort-order")
      .addEventListener("change", filterBooks);

    // Reset button
    var resetButton = document.getElementById("reset-filters");
    if (resetButton) {
      resetButton.addEventListener("click", resetFilters);
    }
  }

  // Reset all filters
  function resetFilters() {
    var allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < allCheckboxes.length; i++) {
      allCheckboxes[i].checked = false;
    }
    document.getElementById("sort-order").value = "newest";
    filterBooks();
  }

  // Initialize on page load
  if (bookList) {
    init();
    setupEventListeners();
    updateBookCount(allBooks.length, allBooks.length);
  }
})();
