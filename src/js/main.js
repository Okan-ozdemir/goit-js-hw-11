// Import libraries
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

console.log('Libraries loaded');

// Select DOM elements
const form = document.querySelector('.app-form');
const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('#search');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more');

// Pagination variables
let currentPage = 1;
const perPage = 20; // Number of images per page
let currentQuery = '';
let totalHits = 0;

// Initialize Lightbox
let lightbox;

// Initialize lightbox when page loads
document.addEventListener('DOMContentLoaded', () => {
  lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
});

// Error check
if (!form || !gallery || !searchInput || !loader) {
  console.error('Required DOM elements not found');
  iziToast.error({
    title: 'Error',
    message: 'An error occurred while loading the page',
    position: 'topRight'
  });
}

// API key and URL
const API_KEY = '50661251-9a872d0be11f09c3db9225566';
const API_URL = 'https://pixabay.com/api/';

// Show/hide loading indicator
const toggleLoader = (show) => {
  loader.style.display = show ? 'block' : 'none';
};

// Show error message
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

// Show info message
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

// Fetch images from API
const fetchImages = async (query, page = 1) => {
  try {
    toggleLoader(true);
    
    console.log('Starting API request...');
    console.log('Search term:', query);
    
    const params = {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: perPage,
      page: page
    };
    
    console.log('Sending parameters:', params);
    
    const response = await axios.get(API_URL, { 
      params,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('API response received:', response);
    console.log('Total results:', response.data.total);
    console.log('Images returned:', response.data.hits?.length || 0);
    
    if (!response.data.hits || response.data.hits.length === 0) {
      // Throw a custom error for empty results
      const error = new Error('No images found');
      error.isEmpty = true; // Adding a custom flag
      throw error;
    }
    
    return response.data;
    
  } catch (error) {
    // Show error message only for unexpected errors like network issues
    if (!error.isEmpty) {
      showError('An error occurred while loading images. Please try again later.');
    }
    console.error('API Error:', error);
    return { hits: [], totalHits: 0 };
  } finally {
    toggleLoader(false);
  }
};

// Display images in the gallery
const displayImages = (images) => {
  console.log('displayImages called, image count:', images?.length || 0);
  
  if (!images || images.length === 0) {
    const errorMsg = 'Sorry, no images found matching your search. Please try a different term.';
    console.warn(errorMsg);
    showError(errorMsg);
    return;
  }

  console.log('Processing images...');
  
  try {
    // Clear existing content
    // gallery.innerHTML = '';
    
    // Create card for each image
    images.forEach((img, index) => {
      console.log(`Image ${index + 1}:`, {
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
            onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=Image+Not+Available'"
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
    
    console.log('Refreshing Lightbox...');
    // Reinitialize Lightbox
    if (lightbox) {
      lightbox.destroy();
    }
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    
    console.log('Images loaded successfully!');
  } catch (error) {
    console.error('Error displaying images:', error);
    showError('An error occurred while displaying images. Please refresh the page and try again.');
  }
};

// When form is submitted
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const searchTerm = searchInput.value.trim();
  
  if (!searchTerm) {
    showError('Please enter a search term');
    return;
  }
  
  try {
    console.log('Starting search...');
    currentQuery = searchTerm;
    currentPage = 1;
    
    // Clear previous results
    gallery.innerHTML = '';
    
    // Show loading indicator
    toggleLoader(true);
    
    // Load first page
    const data = await fetchImages(searchTerm, currentPage);
    
    if (data.hits && data.hits.length > 0) {
      totalHits = data.totalHits;
      displayImages(data.hits);
      
      // Show button if there are more results
      if (data.hits.length >= perPage && currentPage * perPage < totalHits) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    } else {
      showError('No images found matching your criteria.');
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error during search:', error);
    loadMoreBtn.style.display = 'none';
  } finally {
    toggleLoader(false);
  }
});

// When load more button is clicked
loadMoreBtn.addEventListener('click', async () => {
  if (!currentQuery) return;
  
  try {
    loadMoreBtn.disabled = true;
    currentPage++;
    
    const data = await fetchImages(currentQuery, currentPage);
    
    if (data.hits && data.hits.length > 0) {
      displayImages(data.hits);
      
      // Hide button if no more results
      if (currentPage * perPage >= totalHits) {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading more images:', error);
    showError('An error occurred while loading more images.');
  } finally {
    loadMoreBtn.disabled = false;
  }
});
