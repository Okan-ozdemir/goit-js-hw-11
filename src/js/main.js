// Kütüphaneleri import et
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

console.log('Kütüphaneler yüklendi');

// DOM elementlerini seç
const form = document.querySelector('.app-form');
const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('#search');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more');

// Sayfalama için değişkenler
let currentPage = 1;
const perPage = 20; // Sayfa başına görsel sayısı
let currentQuery = '';
let totalHits = 0;

// Lightbox'ı başlat
let lightbox;

// Sayfa yüklendiğinde lightbox'ı başlat
document.addEventListener('DOMContentLoaded', () => {
  lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
});

// Hata kontrolü
if (!form || !gallery || !searchInput || !loader) {
  console.error('Gerekli DOM elementleri bulunamadı');
  iziToast.error({
    title: 'Hata',
    message: 'Sayfa yüklenirken bir hata oluştu',
    position: 'topRight'
  });
}

// API anahtarı ve URL
const API_KEY = '50661251-9a872d0be11f09c3db9225566';
const API_URL = 'https://pixabay.com/api/';

// Yükleme göstergesini göster/gizle
const toggleLoader = (show) => {
  loader.style.display = show ? 'block' : 'none';
};

// Hata göster
const showError = (message) => {
  iziToast.show({
    message: message,
    position: 'topRight',
    backgroundColor: '#ff5252',
    messageColor: '#fff',
    timeout: 3000,
    progressBar: false,
    close: false,
    displayMode: 'once'
  });
};

// Bilgi mesajı göster
const showInfo = (message) => {
  iziToast.show({
    message: message,
    position: 'topRight',
    backgroundColor: '#4caf50',
    messageColor: '#fff',
    timeout: 3000,
    progressBar: false,
    close: false,
    displayMode: 'once'
  });
};

// Görselleri getir
const fetchImages = async (query, page = 1) => {
  try {
    toggleLoader(true);
    
    console.log('API isteği başlatılıyor...');
    console.log('Aranan terim:', query);
    
    const params = {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: perPage,
      page: page
    };
    
    console.log('Gönderilen parametreler:', params);
    
    const response = await axios.get(API_URL, { 
      params,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('API yanıtı alındı:', response);
    console.log('Toplam sonuç:', response.data.total);
    console.log('Dönen görsel sayısı:', response.data.hits?.length || 0);
    
    if (!response.data.hits || response.data.hits.length === 0) {
      // Boş sonuç durumunda özel bir hata fırlatıyoruz
      const error = new Error('Görsel bulunamadı');
      error.isEmpty = true; // Özel bir bayrak ekliyoruz
      throw error;
    }
    
    return response.data;
    
  } catch (error) {
    // Sadece ağ hatası gibi beklenmeyen hatalar için genel hata mesajı göster
    if (!error.isEmpty) {
      showError('Görseller yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
    console.error('API Hatası:', error);
    return { hits: [], totalHits: 0 };
  } finally {
    toggleLoader(false);
  }
};

// Görüntüleri göster
const displayImages = (images) => {
  console.log('displayImages çağrıldı, görsel sayısı:', images?.length || 0);
  
  if (!images || images.length === 0) {
    const errorMsg = 'Üzgünüz, arama sorgunuza uygun görsel bulunamadı. Lütfen farklı bir terim deneyin.';
    console.warn(errorMsg);
    showError(errorMsg);
    return;
  }

  console.log('Görseller işleniyor...');
  
  try {
    // Mevcut içeriği temizle
    // gallery.innerHTML = '';
    
    // Her bir görsel için kart oluştur
    images.forEach((img, index) => {
      console.log(`Görsel ${index + 1}:`, {
        webformatURL: img.webformatURL,
        largeImageURL: img.largeImageURL,
        tags: img.tags
      });
      
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      
      galleryItem.innerHTML = `
        <a href="${img.largeImageURL}">
          <img 
            src="${img.webformatURL}" 
            alt="${img.tags}" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=Resim+Yüklenemedi'"
          />
        </a>
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
      `;
      
      gallery.appendChild(galleryItem);
    });
    
    console.log('Lightbox yenileniyor...');
    // Lightbox'ı yeniden başlat
    if (lightbox) {
      lightbox.destroy();
    }
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    
    console.log('Görseller başarıyla yüklendi!');
  } catch (error) {
    console.error('Görseller gösterilirken hata oluştu:', error);
    showError('Görseller gösterilirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
  }
};

// Form gönderildiğinde

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const searchTerm = searchInput.value.trim();
  
  if (!searchTerm) {
    showError('Lütfen bir arama terimi girin');
    return;
  }
  
  try {
    console.log('Arama başlatılıyor...');
    currentQuery = searchTerm;
    currentPage = 1;
    
    // Önceki sonuçları temizle
    gallery.innerHTML = '';
    
    // Yükleme göstergesini göster
    toggleLoader(true);
    
    // İlk sayfayı yükle
    const data = await fetchImages(searchTerm, currentPage);
    
    if (data.hits && data.hits.length > 0) {
      totalHits = data.totalHits;
      displayImages(data.hits);
      
      // Eğer daha fazla sonuç varsa butonu göster
      if (data.hits.length >= perPage && currentPage * perPage < totalHits) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    } else {
      showError('Aradığınız kriterlere uygun görsel bulunamadı.');
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Arama sırasında hata oluştu:', error);
    loadMoreBtn.style.display = 'none';
  } finally {
    toggleLoader(false);
  }
});

// Daha fazla yükle butonuna tıklandığında
loadMoreBtn.addEventListener('click', async () => {
  if (!currentQuery) return;
  
  try {
    loadMoreBtn.disabled = true;
    currentPage++;
    
    const data = await fetchImages(currentQuery, currentPage);
    
    if (data.hits && data.hits.length > 0) {
      displayImages(data.hits);
      
      // Eğer daha fazla sonuç yoksa butonu gizle
      if (currentPage * perPage >= totalHits) {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Daha fazla yükleme sırasında hata oluştu:', error);
    showError('Daha fazla görsel yüklenirken bir hata oluştu.');
  } finally {
    loadMoreBtn.disabled = false;
  }
});
