document.addEventListener("DOMContentLoaded", () => {
  const images = Array.from(document.querySelectorAll(".in-text-image img, .article-content img"));
  if (!images.length) return;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "image-overlay";
  overlay.innerHTML = `
    <img aria-hidden="true">
    <figcaption></figcaption>
    <div class="loading-indicator" aria-hidden="true">Loading...</div>
    <button class="overlay-btn overlay-close" aria-label="Close image overlay">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <button class="overlay-btn overlay-prev" aria-label="Previous image">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"></path>
      </svg>
    </button>
    <button class="overlay-btn overlay-next" aria-label="Next image">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18l6-6-6-6"></path>
      </svg>
    </button>
    <button class="overlay-btn overlay-download" aria-label="Download current image">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
      </svg>
    </button>
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector("img");
  const overlayCaption = overlay.querySelector("figcaption");
  const loadingIndicator = overlay.querySelector(".loading-indicator");
  let currentIndex = 0;

  // Precompute metadata
  const imageData = images.map((img, index) => {
    const figure = img.closest("figure");
    const caption = figure?.querySelector("figcaption")?.textContent || img.alt || "";
    img.classList.add("clickable-image");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `View image ${index + 1} in gallery`);
    return { element: img, src: img.src, caption, index };
  });

  function extractFilename(url) {
    try {
      const pathname = new URL(url, window.location.origin).pathname;
      const clean = pathname.split("/").pop().split("?")[0];
      return clean.includes(".") ? clean : `${clean}.jpg`;
    } catch {
      return "image.jpg";
    }
  }

  function showOverlay(index) {
    if (index < 0 || index >= imageData.length) return;
    const data = imageData[index];
    currentIndex = index;

    overlay.classList.add("loading");
    loadingIndicator.style.display = "block";

    overlayImg.onload = () => {
      overlay.classList.remove("loading");
      loadingIndicator.style.display = "none";
    };

    overlayImg.onerror = () => {
      overlay.classList.remove("loading");
      loadingIndicator.style.display = "none";
      console.warn("Failed to load image:", data.src);
    };

    overlayImg.src = data.src;
    overlayCaption.textContent = data.caption;
    overlay.classList.add("show");
    overlay.querySelector(".overlay-close").focus();

    // Update aria-live without stacking elements
    let announcement = overlay.querySelector(".sr-only");
    if (!announcement) {
      announcement = document.createElement("div");
      announcement.className = "sr-only";
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      overlay.appendChild(announcement);
    }
    announcement.textContent = `Image ${index + 1} of ${imageData.length}${data.caption ? ': ' + data.caption : ''}`;
  }

  function hideOverlay() {
    overlay.classList.remove("show");
    imageData[currentIndex]?.element.focus();
  }

  imageData.forEach((data, index) => {
    const handleActivate = () => showOverlay(index);
    data.element.addEventListener("click", handleActivate);
    data.element.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    });
  });

  overlay.querySelector(".overlay-close").addEventListener("click", hideOverlay);
  overlay.querySelector(".overlay-next").addEventListener("click", () => showOverlay((currentIndex + 1) % imageData.length));
  overlay.querySelector(".overlay-prev").addEventListener("click", () => showOverlay((currentIndex - 1 + imageData.length) % imageData.length));
  overlay.querySelector(".overlay-download").addEventListener("click", () => {
    const data = imageData[currentIndex];
    const link = document.createElement("a");
    link.href = data.src;
    link.download = extractFilename(data.src);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay || e.target === overlayImg) hideOverlay();
  });

  document.addEventListener("keydown", e => {
    if (!overlay.classList.contains("show")) return;
    switch (e.key) {
      case "Escape": hideOverlay(); break;
      case "ArrowRight": overlay.querySelector(".overlay-next").click(); break;
      case "ArrowLeft": overlay.querySelector(".overlay-prev").click(); break;
      case "Home": showOverlay(0); break;
      case "End": showOverlay(imageData.length - 1); break;
    }
  });
});
