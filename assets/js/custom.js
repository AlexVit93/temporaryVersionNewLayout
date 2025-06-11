// document.addEventListener("DOMContentLoaded", () => {
//   const images = document.querySelectorAll(".our__sertificates-image");
//   const overlay = document.createElement("div");
//   overlay.classList.add("zoomable-overlay");

//   overlay.innerHTML = `
//     <div class="controls">
//       <button class="zoom"></button>
//       <button class="close">&times;</button>
//     </div>
//     <div class="arrows">
//       <button class="arrow left">&lt;</button>
//       <button class="arrow right">&gt;</button>
//     </div>
//     <img src="" alt="Зуммированное изображение" />
//   `;
//   document.body.appendChild(overlay);

//   const overlayImg = overlay.querySelector("img");
//   const closeBtn = overlay.querySelector(".close");
//   const zoomBtn = overlay.querySelector(".zoom");
//   const leftArrow = overlay.querySelector(".arrow.left");
//   const rightArrow = overlay.querySelector(".arrow.right");

//   let currentIndex = 0;
//   let isZoomed = false;

//   function updateImage(index) {
//     currentIndex = index;
//     overlayImg.classList.remove("active");
//     setTimeout(() => {
//       overlayImg.src = images[currentIndex].src;
//       overlayImg.classList.add("active");
//     }, 100);
//   }

//   images.forEach((img, index) => {
//     img.addEventListener("click", () => {
//       updateImage(index);
//       overlay.classList.add("active");
//     });
//   });

//   closeBtn.addEventListener("click", () => {
//     overlay.classList.remove("active");
//     isZoomed = false;
//     zoomBtn.classList.remove("zoom-out");
//   });

//   overlay.addEventListener("click", (e) => {
//     if (e.target === overlay) {
//       overlay.classList.remove("active");
//       isZoomed = false;
//       zoomBtn.classList.remove("zoom-out");
//     }
//   });

//   zoomBtn.addEventListener("click", () => {
//     if (!isZoomed) {
//       overlayImg.style.transform = "scale(1.5)";
//       zoomBtn.classList.add("zoom-out");
//       isZoomed = true;
//     } else {
//       overlayImg.style.transform = "scale(1)";
//       zoomBtn.classList.remove("zoom-out");
//       isZoomed = false;
//     }
//   });

//   leftArrow.addEventListener("click", () => {
//     currentIndex = (currentIndex - 1 + images.length) % images.length;
//     updateImage(currentIndex);
//   });

//   rightArrow.addEventListener("click", () => {
//     currentIndex = (currentIndex + 1) % images.length;
//     updateImage(currentIndex);
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".our__sertificates-image");

  // 1. Предзагрузка с кешированием
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

  // 2. Улучшенный переход без вспышек
  function smoothTransition(newIndex, direction) {
    if (isAnimating || !loadedImages[newIndex]) return;
    isAnimating = true;

    // Плавное исчезновение текущего
    overlayImg.style.transition = "opacity 0.3s ease";
    overlayImg.style.opacity = "0";

    setTimeout(() => {
      // Мгновенная подмена изображения
      overlayImg.src = loadedImages[newIndex].src;
      overlayImg.style.transition = "none";
      overlayImg.style.opacity = "0";

      // Плавное появление нового
      requestAnimationFrame(() => {
        overlayImg.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        overlayImg.style.opacity = "1";
        overlayImg.style.transform = isZoomed ? "scale(2)" : "scale(1)";

        currentIndex = newIndex;
        isAnimating = false;
      });
    }, 300);
  }

  // 3. Обработчики кликов
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
    });
  });

  // 4. Навигация стрелками
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

  // 5. Закрытие и зум (без изменений)
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
    overlayImg.style.transform = isZoomed ? "scale(1.5)" : "scale(1)";
    zoomBtn.classList.toggle("zoom-out", isZoomed);
  });
});
