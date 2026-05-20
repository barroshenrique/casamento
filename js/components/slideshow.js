// js/components/slideshow.js

let slideshowTimeout = null;
let currentSlideIndex = 0;

/**
 * Inicializa o banner rotativo dinâmico de fotos.
 * @param {string[]} photoUrls - Lista de URLs de imagens para o slideshow
 */
export function initSlideshow(photoUrls) {
  if (slideshowTimeout) {
    clearTimeout(slideshowTimeout);
  }

  const container = document.getElementById("hero-slideshow");
  const indicatorsContainer = document.getElementById("slide-indicators");

  if (!container) return;

  // Limpa o conteúdo anterior
  container.innerHTML = "";
  if (indicatorsContainer) indicatorsContainer.innerHTML = "";

  if (!photoUrls || photoUrls.length === 0) {
    // Foto padrão caso não haja imagens cadastradas
    photoUrls = ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200"];
  }

  // 1. Criar os elementos dos slides
  photoUrls.forEach((url, index) => {
    const slide = document.createElement("div");
    slide.className = `slide ${index === 0 ? "active" : ""}`;
    slide.style.backgroundImage = `url('${url}')`;
    
    const overlay = document.createElement("div");
    overlay.className = "slide-overlay";
    slide.appendChild(overlay);
    
    container.appendChild(slide);

    // 2. Criar indicador correspondente (bolinha)
    if (indicatorsContainer) {
      const btn = document.createElement("button");
      btn.className = `indicator ${index === 0 ? "active" : ""}`;
      btn.setAttribute("aria-label", `Foto ${index + 1}`);
      btn.addEventListener("click", () => goToSlide(index));
      indicatorsContainer.appendChild(btn);
    }
  });

  currentSlideIndex = 0;
  startAutoplay(photoUrls.length);
}

function startAutoplay(slidesCount) {
  if (slidesCount <= 1) return;

  function nextSlide() {
    const nextIndex = (currentSlideIndex + 1) % slidesCount;
    goToSlide(nextIndex);
    slideshowTimeout = setTimeout(nextSlide, 5000); // Troca a cada 5 segundos
  }

  slideshowTimeout = setTimeout(nextSlide, 5000);
}

function goToSlide(index) {
  const slides = document.querySelectorAll("#hero-slideshow .slide");
  const indicators = document.querySelectorAll("#slide-indicators .indicator");

  if (slides.length === 0) return;

  // Desativa o slide anterior
  slides[currentSlideIndex].classList.remove("active");
  if (indicators[currentSlideIndex]) {
    indicators[currentSlideIndex].classList.remove("active");
  }

  // Ativa o novo slide
  currentSlideIndex = index;
  slides[currentSlideIndex].classList.add("active");
  if (indicators[currentSlideIndex]) {
    indicators[currentSlideIndex].classList.add("active");
  }
}
