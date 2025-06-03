console.log('JavaScript yüklendi');

// Axios yükle
import axios from 'axios';

// DOM elementlerini seç
const form = document.querySelector('.app-form');
const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('#search');

console.log('Form:', form);
console.log('Gallery:', gallery);
console.log('Search Input:', searchInput);

if (!form || !gallery || !searchInput) {
  console.error('Bir veya daha fazla DOM elementi bulunamadı');
}

// API anahtarı ve URL
const API_KEY = '50661251-9a872d0be11f09c3db9225566';
const API_URL = 'https://pixabay.com/api/';

// API'den görüntüleri al
const fetchImages = async (query) => {
  try {
    console.log('API çağrısı yapılıyor:', query);
    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 12,
        lang: 'en' // Dil parametresini ekliyoruz
      }
    });
    console.log('API yanıt:', response.data);
    return response.data;
  } catch (error) {
    console.error('Hata:', error);
    if (error.response && error.response.data && error.response.data.message) {
      alert(error.response.data.message);
    } else {
      alert('Error fetching images: ' + error.message);
    }
    return { hits: [] };
  }
};

// Görüntüleri göster
const displayImages = (images) => {
  gallery.innerHTML = '';
  console.log('Görüntüler gösteriliyor:', images.length);
  
  images.forEach(img => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    galleryItem.innerHTML = `
      <img src="${img.webformatURL}" alt="${img.tags}">
      <div class="content">
        <div class="info">
          <span class="key">Likes:</span>
          <span class="value">${img.likes}</span>
        </div>
        <div class="info">
          <span class="key">Views:</span>
          <span class="value">${img.views}</span>
        </div>
      </div>
    `;
    
    gallery.appendChild(galleryItem);
  });
};

// Form gönderildiğinde
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('Form gönderildi');
  
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    alert('Please enter a search term');
    return;
  }

  console.log('Arama terimi:', searchTerm);
  const data = await fetchImages(searchTerm);
  if (data.hits.length === 0) {
    alert('No images found');
    return;
  }

  displayImages(data.hits);
});
