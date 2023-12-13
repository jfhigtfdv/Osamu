var previous = 'home';

const navItems = document.querySelectorAll('.nav-item');
const button = document.getElementById("back-button");
const userInput = document.getElementById("user-input");
const searchButton = document.getElementById("search-button");

navItems.forEach(navItem => {
  navItem.addEventListener('click', () => {

    navItems.forEach(item => item.classList.remove('active'));

    const targetPage = navItem.getAttribute('data-target');

    navItem.classList.add('active');

    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    document.getElementById(targetPage).classList.add('active');

    previous = targetPage;

    var imageContainerSearch = document.getElementById("image-container-search");
    imageContainerSearch.innerHTML = "";

    clearTab();
  });
});

button.addEventListener("click", function() {
  if (previous) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(previous).classList.add('active');
    const margin_left = document.getElementById("space-margin");

    const sideNav = document.getElementById("sidenav");
    sideNav.style.display = '';
    margin_left.style.display = '';

    clearTab();
  }
});

function handleSearch() {
  if (userInput.value.trim() !== '') {
    var aboutSection = document.getElementById("search");
    var pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    aboutSection.classList.add('active');

    var imageContainerSearch = document.getElementById("image-container-search");
    imageContainerSearch.innerHTML = "";

    previous = 'search';
    clearTab();

    searches(userInput.value); 
  }
}

searchButton.addEventListener("click", handleSearch);

userInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});

userInput.addEventListener("input", function() {
  if (userInput.value.trim() !== '') {
    searchButton.removeAttribute('disabled');
  } else {
    searchButton.setAttribute('disabled', 'true');
  }
});

function clearTab() {
    const navList = document.querySelector('nav ul');
    if (navList.classList.contains('active')) {
      navList.classList.remove('active');
      document.body.style.overflow = '';
    }
    var imageContainerDetails = document.getElementById("image-container-details");
    var animeDetails = document.getElementById("anime-description");
    var animeType = document.getElementById("type-anime");
    var animeDate = document.getElementById("release-date");
    var animeStatus = document.getElementById("status");
    var animeGenres = document.getElementById("genres");
    var animeTotal = document.getElementById("totalEpisodes");
    var animeSynopsis = document.getElementById("synopsis");
    var videoContainer = document.getElementById("video-container");
    var episodeButtonsContainer = document.getElementById("episode-buttons-container");

    imageContainerDetails.innerHTML = "";
    animeDetails.innerHTML = "";
    animeType.innerHTML = "";
    animeDate.innerHTML = "";
    animeStatus.innerHTML = "";
    animeGenres.innerHTML = "";
    animeTotal.innerHTML = "";
    animeSynopsis.innerHTML = "";
    videoContainer.innerHTML = "";
    episodeButtonsContainer.innerHTML = "";
}

// Add this event listener to toggle the 'active' class on the mobile navigation
document.getElementById('button-30').addEventListener('click', function () {
  const navList = document.querySelector('nav ul');
  navList.classList.toggle('active');
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Add smooth scrolling effect
  });

  // Toggle body overflow based on navigation state
  if (navList.classList.contains('active')) {
    document.body.style.overflow = 'hidden'; // Disable scrolling when navigation is active
  } else {
    document.body.style.overflow = ''; // Enable scrolling when navigation is closed
  }
});

function redirectTo(url) {
  window.location.href = url;
}