import axios from 'axios';

const form = document.querySelector('.app-form');
const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('#search');

const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const API_URL = 'https://pixabay.com/api/';

const fetchImages = async (query) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 12
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    alert('Error fetching images');
  }
};

const displayImages = (images) => {
  gallery.innerHTML = '';
  
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    alert('Please enter a search term');
    return;
  }

  const data = await fetchImages(searchTerm);
  if (data.hits.length === 0) {
    alert('No images found');
    return;
  }

  displayImages(data.hits);
});

form.addEventListener('submit', event => {
  event.preventDefault(); // Sayfa Yenilenmesini Engeller
  gallery.innerHTML = ''; // Her Submit'te Galeri Temizlenir
  const searchValue = form.elements.search.value;

  axios
    .get('https://pixabay.com/api/', {
      params: {
        key: '21250106-0015933422f1e636de5f184b8',
        q: searchValue,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    })
    .then(response => {
      console.log(response);
      const images = response.data.hits;
      if (images.length === 0) {
        iziToast.error({
          position: 'topRight',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
      } else {
        images.forEach(img => {
          console.log(img);
          gallery.innerHTML += `
          <li class="gallery-item">
          <a href="${img.largeImageURL}">
            <img src="${img.webformatURL}" width="360" height="200" alt="${img.tags}" />
          </a>
          <div class="content">
            <div class="info">
              <h5 class="key">Likes</h5>
              <p class="value">${img.likes}</p>
            </div>
            <div class="info">
              <h5 class="key">Views</h5>
              <p class="value">${img.views}</p>
            </div>
            <div class="info">
              <h5 class="key">Comments</h5>
              <p class="value">${img.comments}</p>
            </div>
            <div class="info">
              <h5 class="key">Downloads</h5>
              <p class="value">${img.downloads}</p>
            </div>
          </div>
        </li>`;
        });

        const lightBox = new SimpleLightbox('.gallery a', {
          /* options */
        });

        lightBox.refresh();
      }
    })
    .catch(error => {
      console.error(error);
    });
});
