document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".our__sertificates-image");
  const ZOOM_SCALE = 2.5;
  const loadedImages = [];
  images.forEach((img, index) => {
    const preload = new Image();
    preload.src = img.src;
    preload.onload = () => (loadedImages[index] = preload);
  });

  const overlay = document.createElement("div");
  overlay.classList.add("zoomable-overlay");
  overlay.innerHTML = `
    <div class="controls">
      <button class="zoom"></button>
      <button class="close">&times;</button>
    </div>
    <div class="arrows">
      <button class="arrow left">&lt;</button>
      <button class="arrow right">&gt;</button>
    </div>
    <img src="" alt="Зуммированное изображение" class="active" />
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector("img");
  const closeBtn = overlay.querySelector(".close");
  const zoomBtn = overlay.querySelector(".zoom");
  const leftArrow = overlay.querySelector(".arrow.left");
  const rightArrow = overlay.querySelector(".arrow.right");

  let currentIndex = 0;
  let isZoomed = false;
  let isAnimating = false;

  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let imgOffset = { x: 0, y: 0 };

  function smoothTransition(newIndex, direction) {
    if (isAnimating || !loadedImages[newIndex]) return;
    isAnimating = true;

    overlayImg.style.transition = "opacity 0.3s ease";
    overlayImg.style.opacity = "0";

    setTimeout(() => {
      overlayImg.src = loadedImages[newIndex].src;
      overlayImg.style.transition = "none";
      overlayImg.style.opacity = "0";
      overlayImg.style.transform = "scale(1)";
      imgOffset = { x: 0, y: 0 };

      requestAnimationFrame(() => {
        overlayImg.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        overlayImg.style.opacity = "1";
        overlayImg.style.transform = isZoomed
          ? `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${ZOOM_SCALE})`
          : "scale(1)";

        currentIndex = newIndex;
        isAnimating = false;
      });
    }, 300);
  }

  images.forEach((img, index) => {
    img.addEventListener("click", () => {
      if (!loadedImages[index]) return;
      currentIndex = index;
      overlayImg.src = loadedImages[index].src;
      overlayImg.style.opacity = "1";
      overlayImg.style.transform = "scale(1)";
      overlay.classList.add("active");

      isZoomed = false;
      zoomBtn.classList.remove("zoom-out");
      imgOffset = { x: 0, y: 0 };
      overlayImg.style.cursor = "auto";
    });
  });

  leftArrow.addEventListener("click", (e) => {
    e.stopPropagation();
    smoothTransition(
      (currentIndex - 1 + images.length) % images.length,
      "left"
    );
  });

  rightArrow.addEventListener("click", (e) => {
    e.stopPropagation();
    smoothTransition((currentIndex + 1) % images.length, "right");
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
    }
  });

  zoomBtn.addEventListener("click", () => {
    isZoomed = !isZoomed;

    if (isZoomed) {
      overlayImg.style.cursor = "grab";
      overlayImg.style.transform = `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${ZOOM_SCALE})`;
    } else {
      overlayImg.style.cursor = "auto";
      imgOffset = { x: 0, y: 0 };
      overlayImg.style.transform = "translate(0, 0) scale(1)";
    }

    zoomBtn.classList.toggle("zoom-out", isZoomed);
  });

  overlayImg.addEventListener("mousedown", (e) => {
    if (!isZoomed) return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    overlayImg.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    overlayImg.style.transform = `translate(${imgOffset.x + dx}px, ${
      imgOffset.y + dy
    }px) scale(${ZOOM_SCALE})`;
  });

  window.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    imgOffset.x += e.clientX - dragStart.x;
    imgOffset.y += e.clientY - dragStart.y;
    overlayImg.style.cursor = "grab";
  });
});
