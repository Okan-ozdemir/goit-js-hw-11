import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// DOM elementlerini seç
const form = document.querySelector('.app-form');
const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('#search');
const loader = document.querySelector('.loader');

// API anahtarı ve URL
const API_KEY = '50661251-9a872d0be11f09c3db9225566';
const API_URL = 'https://pixabay.com/api/';

// Yükleme göstergesini göster/gizle
const toggleLoader = (show) => {
  loader.style.display = show ? 'block' : 'none';
};

// Hata mesajı göster
const showError = (message) => {
  iziToast.error({
    title: 'Error',
    message: message,
    position: 'topRight'
  });
};

// Başarılı mesaj göster
const showSuccess = (message) => {
  iziToast.success({
    title: 'Success',
    message: message,
    position: 'topRight'
  });
};

// API'den görüntüleri al
const fetchImages = async (query) => {
  try {
    toggleLoader(true);
    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 12,
        lang: 'en'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Hata:', error);
    showError('Error fetching images');
    return { hits: [] };
  } finally {
    toggleLoader(false);
  }
};

// Görüntüleri göster
const displayImages = (images) => {
  gallery.innerHTML = '';
  
  if (images.length === 0) {
    showError('No images found');
    return;
  }

  const markup = images.map(img => `
    <a href="${img.largeImageURL}" class="gallery-link">
      <div class="gallery-item">
        <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy">
        <div class="info">
          <p class="info-item">
            <b>Likes</b> ${img.likes}
          </p>
          <p class="info-item">
            <b>Views</b> ${img.views}
          </p>
          <p class="info-item">
            <b>Comments</b> ${img.comments}
          </p>
          <p class="info-item">
            <b>Downloads</b> ${img.downloads}
          </p>
        </div>
      </div>
    </a>
  `).join('');

  gallery.innerHTML = markup;
  
  // SimpleLightbox initialize
  const lightbox = new SimpleLightbox('.gallery-link', {
    captionsData: 'alt',
    captionDelay: 250
  });
  
  // Refresh lightbox after DOM updates
  lightbox.refresh();
};

// Form gönderildiğinde
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    showError('Please enter a search term');
    return;
  }

  const data = await fetchImages(searchTerm);
  displayImages(data.hits);
});
