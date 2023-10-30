// Selecting elements
const movieCardContainer = document.querySelector(".movieCard-Container");
const genreContainer = document.querySelector(".genre-container");
const input = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const modal = document.querySelector(".modal");
const overlay = document.querySelector("#overlay");

// API configurations
const API_KEY = "b4eef74e28e952ff4355b36a4be8833c";
const BASE_URL = "https://api.themoviedb.org/3/";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

// Initialize with the latest movies
const DEFAULT_API_URL = `${BASE_URL}movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;
getMovies(DEFAULT_API_URL);

// Event listener for the search button
searchBtn.addEventListener("click", () => {
  const searchTerm = input.value.trim();
  const searchURL = `${BASE_URL}search/movie?api_key=${API_KEY}&query=${searchTerm}`;
  getMovies(searchTerm ? searchURL : DEFAULT_API_URL);
});

// Event listener for overlay click
overlay.addEventListener("click", () => {
  closeActiveModals();
});

// Function to close active modals
function closeActiveModals() {
  const activeModals = document.querySelectorAll(".modal.Active");
  activeModals.forEach((activeModal) => {
    closeModal(activeModal);
  });
}

// Function to get movie details by ID
function getMovieUrl(movieId) {
  return `${BASE_URL}movie/${movieId}?api_key=${API_KEY}`;
}

// Function to fetch and display movies
async function getMovies(url) {
  const response = await fetch(url);
  const data = await response.json();
  renderMovies(data.results);
}

// Function to clear movie cards
function clearMovieCards() {
  while (movieCardContainer.firstChild) {
    movieCardContainer.removeChild(movieCardContainer.firstChild);
  }
}

// Function to render movie cards
function renderMovies(data) {
  clearMovieCards();
  data.forEach((movie) => {
    const { id, title, poster_path, original_language, vote_average } = movie;
    const movieElement = createMovieElement(id, title, poster_path, original_language, vote_average);
    movieCardContainer.appendChild(movieElement);
    movieElement.addEventListener("click", () => {
      const url = getMovieUrl(id);
      fetch(url)
        .then((res) => res.json())
        .then((movieData) => {
          openModal(movieData);
        });
    });
  });
}

// Function to create a movie card element
function createMovieElement(id, title, posterPath, language, rating) {
  const movieElement = document.createElement("div");
  movieElement.classList.add("movies");
  movieElement.id = id;
  movieElement.innerHTML = `
    <img src="${IMAGE_URL + posterPath}" alt="${title}"/>
    <h3 class="title">${title}</h3>
    <div class="lang-rating-container">
      <div class="lang">${language.toUpperCase()}</div>
      <div class="rating">${rating}</div>
    </div>
  `;
  return movieElement;
}

// Function to open the modal with movie details
function openModal(movieData) {
  if (!modal) return;
  modal.classList.add("Active");
  overlay.classList.add("Active");

  const {
    poster_path,
    original_title,
    vote_average,
    original_language,
    runtime,
    genres,
    overview,
  } = movieData;

  const price = vote_average * 40;
  modal.innerHTML = createModalContent(
    poster_path,
    original_title,
    vote_average,
    original_language,
    runtime,
    genres[0].name,
    overview,
    price
  );

  const closeModalButton = document.querySelector("#closeBtn");
  closeModalButton.addEventListener("click", () => {
    closeModal(modal);
  });

  const bookBtn = document.querySelector(".book");
  bookBtn.addEventListener("click", () => {
    openPaymentPage(price, original_title);
  });
}

// Function to create modal content
function createModalContent(posterPath, title, rating, language, runtime, genre, overview, price) {
  return `
    <div class="modal-header">
      <button id="closeBtn" class="closeButton">&times;</button>
    </div>
    <div class="modal-body">
      <div class="img-container">
        <img src="${IMAGE_URL + posterPath}" alt="${title}" />
      </div>
      <div class="movie-details-container">
        <div class="movie-title">${title}</div>
        <div class="rating-movie">${rating.toFixed(1) + "/10"}</div>
        <div class="language-movie">${language.toUpperCase()}</div>
        <div class="runtime-genre-container">
          <div class="runtime-movie">${runtime + " minutes"}</div>
          <div class="separate">|</div>
          <div class="genre">${genre}</div>
        </div>
        <div class="overview">${overview}</div>
        <div class="price">${"Rs " + price}</div>
      </div>
      <div class="footer">
        <button class="book">Book Tickets</button>
      </div>
    </div>
  `;
}

// Function to open the payment page and store data in local storage
function openPaymentPage(price, movieTitle) {
  window.open("./payment.html");
  localStorage.setItem("price", price);
  localStorage.setItem("original_title", movieTitle);
}

// Function to close the modal
function closeModal(modal) {
  if (modal) {
    modal.classList.remove("Active");
    overlay.classList.remove("Active");
  }
}

// Fetch and render movie genres
async function getGenres(url) {
  const response = await fetch(url);
  const data = await response.json();
  renderGenres(data.genres);
}

// Initialize and render movie genres
const genreQuery = `${BASE_URL}genre/movie/list?api_key=${API_KEY}&language=en-US`;
getGenres(genreQuery);

// Selected genres for filtering
const selectedGenres = [];

// Function to render movie genres
function renderGenres(genres) {
  const genreHeading = document.createElement("div");
  genreHeading.textContent = "Genre";
  genreHeading.classList.add("genre-heading");
  genreContainer.appendChild(genreHeading);

  genres.forEach((genre) => {
    const { name, id } = genre;
    const genreElement = createGenreElement(id, name);

    genreElement.addEventListener("click", () => {
      toggleGenreSelection(id, genreElement);
    });

    genreContainer.appendChild(genreElement);
  });
}

// Function to create a genre element
function createGenreElement(id, name) {
  const genreElement = document.createElement("div");
  genreElement.classList.add("genres");
  genreElement.id = id;
  genreElement.textContent = name;
  return genreElement;
}

// Function to toggle genre selection
function toggleGenreSelection(genreId, genreElement) {
  if (selectedGenres.includes(genreId)) {
    genreElement.classList.remove("active");
    selectedGenres.splice(selectedGenres.indexOf(genreId), 1);
  } else {
    genreElement.classList.add("active");
    selectedGenres.push(genreId);
  }

  filterMoviesByGenre();
}

// Function to filter movies by selected genres
function filterMoviesByGenre() {
  if (selectedGenres.length > 0) {
    const genresParam = selectedGenres.join(",");
    getMovies(`${DEFAULT_API_URL}&with_genres=${genresParam}`);
  } else {
    getMovies(DEFAULT_API_URL);
  }
}
