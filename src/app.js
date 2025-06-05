import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

// SimpleLightbox CDN ile index.html'de yüklü!

const PIXABAY_API_KEY = "50661251-9a872d0be11f09c3db9225566";
const PIXABAY_API_URL = "https://pixabay.com/api/";
const PER_PAGE = 40;

// DOM Elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const gallery = document.getElementById("gallery");
const loadingIndicator = document.getElementById("loading");
const noResultsMessage = document.getElementById("noResults");

let lightbox = null;

// API'den görselleri çek
async function fetchImages(query) {
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: query,
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    per_page: PER_PAGE,
  });

  const response = await fetch(`${PIXABAY_API_URL}?${params}`);
  if (!response.ok) throw new Error("API hatası");
  const data = await response.json();
  return data.hits;
}

// Arama formunu işle
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    iziToast.warning({
      message: "Lütfen bir arama terimi girin",
      position: "topRight",
    });
    return;
  }
  showLoading(true);
  showNoResults(false);
  gallery.innerHTML = "";
  try {
    const images = await fetchImages(query);
    if (images.length === 0) {
      showNoResults(true);
      return;
    }
    displayImages(images);
    initLightbox();
  } catch (err) {
    iziToast.error({
      message: "Görseller yüklenirken bir hata oluştu",
      position: "topRight",
    });
  } finally {
    showLoading(false);
  }
});

// Görselleri galeriye ekle
function displayImages(images) {
  gallery.innerHTML = images
    .map(
      (img) => `
        <div class="image-card">
          <a href="${img.largeImageURL}" class="gallery__link" data-lightbox="gallery">
            <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
          </a>
          <div class="image-info">
            <div class="image-stats">
              <span class="stat"><span class="icon">❤️</span> ${img.likes}</span>
              <span class="stat"><span class="icon">👁️</span> ${img.views}</span>
              <span class="stat"><span class="icon">💬</span> ${img.comments}</span>
              <span class="stat"><span class="icon">⬇️</span> ${img.downloads}</span>
            </div>
            <div class="image-tags">${img.tags}</div>
          </div>
        </div>
      `
    )
    .join("");
  gallery.classList.add("has-results");
}

// SimpleLightbox başlat/yenile
function initLightbox() {
  if (lightbox) {
    lightbox.refresh();
  } else {
    lightbox = new window.SimpleLightbox(".gallery a");
  }
}

// Loading göstergesini göster/gizle
function showLoading(show) {
  if (show) {
    loadingIndicator.classList.add("active");
  } else {
    loadingIndicator.classList.remove("active");
  }
}

// Sonuç bulunamadı mesajını göster/gizle
function showNoResults(show) {
  noResultsMessage.style.display = show ? "block" : "none";
}

// Sayfa yüklendiğinde input'u temizle
window.addEventListener("DOMContentLoaded", () => {
  searchInput.value = "";
  gallery.innerHTML = "";
  showNoResults(false);
  showLoading(false);
});
