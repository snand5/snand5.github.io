document.addEventListener("DOMContentLoaded", function() {
  // 1. Early return if no images exist
  const images = Array.from(document.querySelectorAll(".in-text-image img, .article-content img"));
  if (images.length === 0) return;

  // 2. Create overlay
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

  // 3. Store image metadata during processing for performance
  const imageData = [];

  function showOverlay(index) {
    if (index < 0 || index >= imageData.length) return;
    
    const data = imageData[index];
    currentIndex = index;
    
    // Show loading state
    overlay.classList.add("loading");
    loadingIndicator.style.display = "block";
    
    // Handle image loading
    overlayImg.onload = () => {
      overlay.classList.remove("loading");
      loadingIndicator.style.display = "none";
    };
    
    overlayImg.onerror = () => {
      overlay.classList.remove("loading");
      loadingIndicator.style.display = "none";
      console.warn("Failed to load image:", data.src);
      // Could set a fallback image here if desired
    };
    
    overlayImg.src = data.src;
    overlayCaption.textContent = data.caption;
    
    // Show overlay and manage focus
    overlay.classList.add("show");
    overlay.querySelector(".overlay-close").focus();
    
    // Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `Image ${index + 1} of ${imageData.length}${data.caption ? ': ' + data.caption : ''}`;
    overlay.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  function hideOverlay() {
    overlay.classList.remove("show");
    // Return focus to the image that was clicked
    if (currentIndex >= 0 && currentIndex < imageData.length) {
      imageData[currentIndex].element.focus();
    }
  }

  function extractFilename(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'image';
      // Remove query parameters and ensure it has an extension
      const cleanFilename = filename.split('?')[0];
      return cleanFilename.includes('.') ? cleanFilename : `${cleanFilename}.jpg`;
    } catch (e) {
      return 'image.jpg';
    }
  }

  // 4. Process all images: wrap, add classes, add buttons, store metadata
  images.forEach((img, index) => {
    img.classList.add("clickable-image");
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `View image ${index + 1} in gallery`);

    // Wrap in figure if not already (only for content images, not frontmatter)
    let figure = img.closest("figure");
    const isContentImage = img.closest(".article-content");
    
    if (!figure && isContentImage) {
      figure = document.createElement("figure");
      img.parentNode.insertBefore(figure, img);
      figure.appendChild(img);
    }
    
    if (figure) {
      figure.classList.add("in-text-image", "bordered");
    }

    // Get caption text
    const caption = figure?.querySelector("figcaption")?.textContent || img.alt || "";

    // Store metadata
    imageData.push({
      element: img,
      src: img.src,
      caption: caption,
      index: index
    });

    // Add zoom button if missing and we have a figure
    if (figure) {
      let zoomBtn = figure.querySelector(".view-image-btn");
      if (!zoomBtn) {
        zoomBtn = document.createElement("div");
        zoomBtn.className = "view-image-btn";
        zoomBtn.setAttribute("role", "button");
        zoomBtn.setAttribute("tabindex", "0");
        zoomBtn.setAttribute("aria-label", `Expand image ${index + 1}`);
        zoomBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize2 lucide-maximize-2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" x2="14" y1="3" y2="10"></line>
            <line x1="3" x2="10" y1="21" y2="14"></line>
          </svg>
        `;
        figure.appendChild(zoomBtn);
      }

      // Add click and keyboard listeners to button
      const handleButtonActivation = (e) => {
        e.stopPropagation();
        showOverlay(index);
      };
      
      zoomBtn.addEventListener("click", handleButtonActivation);
      zoomBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleButtonActivation(e);
        }
      });
    }

    // Add click and keyboard listeners to image
    const handleImageActivation = () => {
      showOverlay(index);
    };
    
    img.addEventListener("click", handleImageActivation);
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleImageActivation();
      }
    });
  });

  // 5. Overlay button event listeners
  overlay.querySelector(".overlay-close").addEventListener("click", hideOverlay);
  
  overlay.querySelector(".overlay-next").addEventListener("click", () => {
    const nextIndex = (currentIndex + 1) % imageData.length;
    showOverlay(nextIndex);
  });
  
  overlay.querySelector(".overlay-prev").addEventListener("click", () => {
    const prevIndex = (currentIndex - 1 + imageData.length) % imageData.length;
    showOverlay(prevIndex);
  });
  
  overlay.querySelector(".overlay-download").addEventListener("click", () => {
    if (currentIndex >= 0 && currentIndex < imageData.length) {
      const data = imageData[currentIndex];
      const link = document.createElement("a");
      link.href = data.src;
      link.download = extractFilename(data.src);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });

// 6. Close on background click
overlay.addEventListener("click", (e) => {
  if (e.target === overlay || e.target === overlayImg) {
    hideOverlay();
  }
});

  // 7. Keyboard navigation with focus management
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("show")) return;
    
    switch(e.key) {
      case "Escape":
        e.preventDefault();
        hideOverlay();
        break;
      case "ArrowRight":
        e.preventDefault();
        overlay.querySelector(".overlay-next").click();
        break;
      case "ArrowLeft":
        e.preventDefault();
        overlay.querySelector(".overlay-prev").click();
        break;
      case "Home":
        e.preventDefault();
        showOverlay(0);
        break;
      case "End":
        e.preventDefault();
        showOverlay(imageData.length - 1);
        break;
    }
  });
});