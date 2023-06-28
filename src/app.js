import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '37938170-667d0c2889cb3b988ee7fad2b';
const perPage = 20;
let page = 1;
let currentQuery = '';

const searchForm = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreButton = document.getElementById('load-more');
const lightbox = new SimpleLightbox('.gallery a');

function renderImages(images) {
  const cardsHTML = images.map((image) => {
    return `
      <div class="photo-card">
        <a href="${image.largeImageURL}" data-lightbox="gallery">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </div>
    `;
  });

  gallery.insertAdjacentHTML('beforeend', cardsHTML.join(''));

  // Refresh the lightbox after adding new images
  lightbox.refresh();
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}

function showNoResultsMessage() {
  Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
}

function showEndOfResultsMessage() {
  Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
}

async function fetchImages(query) {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    return data.hits;
  } catch (error) {
    console.log('Error:', error);
    return [];
  }
}

async function handleSearchFormSubmit(event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  if (searchQuery === currentQuery) {
    return;
  }

  currentQuery = searchQuery;
  page = 1;

  clearGallery();

  const images = await fetchImages(searchQuery);

  if (images.length > 0) {
    renderImages(images);
    showLoadMoreButton();
  } else {
    showNoResultsMessage();
  }
}

async function handleLoadMoreButtonClick() {
  page++;

  const images = await fetchImages(currentQuery);

  if (images.length > 0) {
    renderImages(images);
  } else {
    hideLoadMoreButton();
    showEndOfResultsMessage();
  }
}

searchForm.addEventListener('submit', handleSearchFormSubmit);
loadMoreButton.addEventListener('click', handleLoadMoreButtonClick);

// Smooth scrolling
function smoothScrollTo(element, duration) {
  const targetPosition = element.offsetTop;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) {
      startTime = currentTime;
    }

    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

// Infinite scroll
window.addEventListener('scroll', () => {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    handleLoadMoreButtonClick();
    smoothScrollTo(loadMoreButton, 500);
  }
});