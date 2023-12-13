document.addEventListener('DOMContentLoaded', async function () {
    var loadingContainer = document.getElementById("lds-ellipsis");
    var container = document.getElementById("container");
    try {

        loadingContainer.style.display = 'inline-block';
        container.style.display = 'none';

        // Top Airing Anime
        var imageContainer = document.getElementById("image-container");
        const topAnimeFetch = await getAnime('top');
        parseAnime(topAnimeFetch, imageContainer);

        // Recent Release
        var imageContainerRecent = document.getElementById("image-container-recent");
        const RecentAnimeFetch = await getAnime('recent');
        parseAnime(RecentAnimeFetch, imageContainerRecent);

        // Popular Anime
        var imageContainerPopular = document.getElementById("image-container-popular");
        const popularAnimeFetch = await getAnime('popular');
        parseAnime(popularAnimeFetch, imageContainerPopular);

        // Movie Anime
        var imageContainerMovie = document.getElementById("image-container-movie");
        const movieAnimeFetch = await getAnime('movies');
        parseAnime(movieAnimeFetch, imageContainerMovie);

        // Trending Movies
        var imageContainerTrendingTvshows = document.getElementById("image-container-trending-tvshows");
        const trendingTvshowsFetch = await getAnime('trendingTvshows');
        parseAnime(trendingTvshowsFetch, imageContainerTrendingTvshows);

    } catch (error) {

    } finally {
        loadingContainer.style.display = 'none';
        container.style.display = 'flex';
    }
});

async function searches(find) {
    var loadingContainer = document.getElementById("lds-ellipsis");
    var container = document.getElementById("container");
    loadingContainer.style.display = 'inline-block';
    container.style.display = 'none';

    try {

        var imageContainerSearch = document.getElementById("image-container-search");
        const search_results = await getAnime('search', find);
        parseAnime(search_results, imageContainerSearch);

    } catch (error) {

    } finally {
        loadingContainer.style.display = 'none';
        container.style.display = 'flex';
    }
}















































// Parse anime to display   
async function parseAnime (res, element, condition) {
    var loadingContainer = document.getElementById("lds-ellipsis");
    var container = document.getElementById("container");
    var sideNav = document.getElementById("sidenav");
    try {
        res.forEach( async function (imgObj) {
            var imageDiv = document.createElement("div");
            imageDiv.classList.add("image-div");

            var imgElement = document.createElement("img");
            imgElement.src = imgObj.serverType === 'parseAnime' ? imgObj.animeImg : imgObj.image;
            imgElement.alt = "Dynamic Image";
            imgElement.classList.add("dynamic-image");

            var descElement = document.createElement("p");
            descElement.textContent = imgObj.serverType === 'parseAnime' ? imgObj.animeTitle : imgObj.title;
            descElement.classList.add("image-description");

            imageDiv.appendChild(imgElement);
            if (condition) {
                var epElement = document.createElement("p");
                epElement.textContent = `Episode: ${Number(imgObj.episode_no) + 1}`;
                epElement.classList.add("image-description-episode-no");
                imageDiv.appendChild(epElement);
            }
            imageDiv.appendChild(descElement);

            element.appendChild(imageDiv);

            imgElement.addEventListener('click', async function () {
                loadingContainer.style.display = 'inline-block';
                container.style.display = 'none';
                sideNav.style.display = 'none';
                let animeDFetch;
                if (imgObj.serverType === 'parseAnime') {
                    animeDFetch = await getAnime('details', imgObj.animeId);
                } else {
                    animeDFetch = await getAnime('info-movies', imgObj.id);
                }
                const animeD = animeDFetch;
                let episodes_list;
                if (imgObj.serverType === 'parseAnime') {
                    episodes_list = await Promise.all(animeD.episodesList.map(item => {return {episodeId: item.episodeId, episodeNum: item.episodeNum}}));
                } else {
                    episodes_list = await Promise.all(animeD.episodes.map(item => {return {episodeId: item.id, episodeNum: item.number}}));
                }
                const episodes_num = episodes_list.map(item => item.episodeNum);
                const episodes_id = episodes_list.map(item => item.episodeId);
                loadingContainer.style.display = 'none';
                container.style.display = 'flex';
                var aboutSection = document.getElementById("description");
                var pages = document.querySelectorAll('.page');
                pages.forEach(page => page.classList.remove('active'));
                aboutSection.classList.add('active');


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
                var margin_left = document.getElementById("space-margin");


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
                margin_left.style.display = 'none';

                var imgDetailsElement = document.createElement("img");
                imgDetailsElement.src = imgObj.serverType === 'parseAnime' ? imgObj.animeImg : imgObj.image;
                imgDetailsElement.alt = "Details Image";
                imgDetailsElement.classList.add("dynamic-image-description");

                var titleElement = document.createElement("p");
                titleElement.innerHTML = `<span class="title-color">Title:</span> ${imgObj.serverType === 'parseAnime' ? imgObj.animeTitle : imgObj.title}`;
                titleElement.classList.add("image-description-title");

                var typeElement = document.createElement("p");
                typeElement.innerHTML = `<span class="type-color">Type:</span> ${animeD.type}`;
                typeElement.classList.add("image-description-type");

                var dateElement = document.createElement("p");
                dateElement.innerHTML = `<span class="release-color">Released Date:</span> ${imgObj.serverType === 'parseAnime' ? animeD.releasedDate : animeD.releaseDate}`;
                dateElement.classList.add("image-description-release");

                var statusElement = document.createElement("p");
                statusElement.innerHTML = `<span class="status-color">Status:</span> ${imgObj.serverType === 'parseAnime' ? animeD.status : 'Not Available'}`;
                statusElement.classList.add("image-description-status");

                var genresElement = document.createElement("p");
                genresElement.innerHTML = `<span class="genre-color">Genre:</span> ${animeD.genres.join(', ')}`;
                genresElement.classList.add("image-description-genres");

                var totalElement = document.createElement("p");
                totalElement.innerHTML = `<span class="total-ep-color">Total Episodes:</span> ${imgObj.serverType === 'parseAnime' ? animeD.totalEpisodes : animeD.episodes.length}`;
                totalElement.classList.add("image-description-total");

                var synopsisElement = document.createElement("p");
                synopsisElement.innerHTML = `<span class="synopsis-color">Synopsis:</span> ${imgObj.serverType === 'parseAnime' ? animeD.synopsis : animeD.description}`;
                synopsisElement.classList.add("image-description-synopsis");

                imageContainerDetails.appendChild(imgDetailsElement);
                animeDetails.appendChild(titleElement);
                animeType.appendChild(typeElement);
                animeDate.appendChild(dateElement);
                animeStatus.appendChild(statusElement);
                animeGenres.appendChild(genresElement);
                animeTotal.appendChild(totalElement);
                animeSynopsis.appendChild(synopsisElement);

                if (imgObj.serverType === 'parseAnime') {
                    episodes_num.reverse();
                    episodes_id.reverse();
                }

                let currentVideo; // Keep track of the current video element

                // Create the select element for episodes
                var episodeSelect = document.createElement("select");
                episodeSelect.id = 'select';
                episodeSelect.classList.add("episode-select");

                var option = document.createElement("option");
                option.text = "Select";
                episodeSelect.appendChild(option);

                episodes_num.forEach(function (episodeNum, index) {
                    // Create an option element for each episode
                    var option = document.createElement("option");
                    option.text = "Episode " + episodeNum;
                    option.value = index; // Use index as the value to identify the selected episode
                    episodeSelect.appendChild(option);
                });

                // Add a change event listener to load the corresponding episode
                episodeSelect.addEventListener('change', async function () {
                    var selectedIndex = episodeSelect.value;
                    saveSession(imgObj.serverType === 'parseAnime' ? imgObj.animeId : imgObj.id, imgObj.serverType === 'parseAnime' ? imgObj.animeTitle : imgObj.title, imgObj.serverType === 'parseAnime' ? imgObj.animeImg : imgObj.image, episodeSelect.value, imgObj.serverType);

                    // Dispose of the previous video
                    if (currentVideo) {
                        currentVideo.pause();
                        currentVideo.removeAttribute('src');
                        currentVideo.load();
                    }

                    // Clear the video container
                    videoContainer.innerHTML = "";

                    // Display loading container
                    loadingContainer.style.display = 'inline-block';
                    container.style.display = 'none';

                    let anime_source_results;
                    if (imgObj.serverType === 'parseAnime') {
                        anime_source_results = await getAnime('stream', episodes_id[selectedIndex]);
                    } else {
                        const data = await getAnime('source-movies', imgObj.id, episodes_id[selectedIndex]);
                        anime_source_results = await Promise.all(data.sources.filter(item => item.quality === 'auto'));
                    }
                    const anime_source = imgObj.serverType === 'parseAnime' ? anime_source_results.source : anime_source_results[0].url;

                    // Create a video element for the selected episode
                    var video = document.createElement('video');
                    video.id = "video-player-" + selectedIndex;
                    video.controls = true;
                    video.classList.add("video-container");

                    // Create a source element with the hls stream URL
                    var source = document.createElement('source');
                    source.src = anime_source;
                    source.type = 'application/x-mpegURL';  // Set the MIME type for HLS

                    // Add the source to the video element
                    video.appendChild(source);

                    // Optionally, add a title for the episode
                    var episodeTitle = "Episode " + episodes_num[selectedIndex];
                    var titleElement = document.createElement('h3');
                    titleElement.textContent = episodeTitle;

                    // Add the video and title to the video container
                    videoContainer.appendChild(titleElement);
                    videoContainer.appendChild(video);

                    currentVideo = video; // Update the current video reference

                    // Initialize the video player using hls.js
                    if (Hls.isSupported()) {
                        var hls = new Hls();
                        hls.loadSource(anime_source);
                        hls.attachMedia(video);
                        video.play();

                        // Add quality control
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            var qualitySwitch = document.createElement('select');
                            qualitySwitch.id = 'qualitySwitch';  // Add a unique id attribute

                            hls.levels.forEach(function (level, index) {
                                var option = document.createElement('option');
                                option.text = level.height + 'p';  // Display resolution as option text
                                option.value = index;  // Use level index as option value
                                qualitySwitch.appendChild(option);
                            });

                            // Add auto quality option
                            var autoOption = document.createElement('option');
                            autoOption.text = 'auto';
                            autoOption.value = -1;  // hls.js uses -1 for auto level
                            qualitySwitch.appendChild(autoOption);

                            // Handle quality switch
                            qualitySwitch.addEventListener('change', function () {
                                hls.currentLevel = parseInt(qualitySwitch.value);
                            });

                            // Append quality switch to video container
                            videoContainer.appendChild(qualitySwitch);
                        });

                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = episodes_ink_m3u8[selectedIndex];
                        video.addEventListener('loadedmetadata', function () {
                            video.play();
                        });
                    }

                    // Hide loading container after video has loaded
                    video.addEventListener('loadeddata', function () {
                        loadingContainer.style.display = 'none';
                        container.style.display = 'flex';
                    });
                });

                // Append the select element to the container
                episodeButtonsContainer.appendChild(episodeSelect);

                // Trigger change event for the first episode to load the initial episode
                if (condition) {
                  episodeSelect.value = imgObj.episode_no;
                  episodeSelect.dispatchEvent(new Event('change'));
                }
            });
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        loadingContainer.style.display = 'none';
        container.style.display = 'flex';
    }
}






















// This function is to fetch anime data's from the AnimeHub
async function getAnime (settings, search, id) {
    var url;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('search')) {
        search = urlParams.get('search');
        search = decodeURIComponent(search);
    }

    switch (settings) {
        case "recent":
            url = 'https://animehub-q89c.onrender.com/recent-release';
            break;

        case "popular":
            url = 'https://animehub-q89c.onrender.com/popular';
            break;

        case "search":
            if (!search) {
                console.error("Missing Search Value");
                return;
            }
            url = `https://animehub-q89c.onrender.com/search?keyw=${search}`;
            break;

        case "movies":
            url = 'https://animehub-q89c.onrender.com/anime-movies';
            break;

        case "top":
            url = 'https://animehub-q89c.onrender.com/top-airing';
            break;

        case "genre":
            if (!search) {
                console.error("Missing Genre Value");
                return;
            }
            url = `https://animehub-q89c.onrender.com/genre/${search}`;
            break;

        case "details":
            if (!search) {
                console.error("Missing AnimeID Value");
                return;
            }
            url = `https://animehub-q89c.onrender.com/anime-details/${search}`;
            break;

        case "stream":
            if (!search) {
                console.error("Missing Episode Value");
                return;
            }
            url = `https://animehub-q89c.onrender.com/vidcdn/watch/${search}`;
            break;

        case "search-movies":
            if (!search) {
                console.error("Missing Search Value");
                return;
            }
            url = `https://animehub-q89c.onrender.com/search/movies?keyw=${search}`;
            break;

        case "info-movies":
            if (!search) {
                console.error("Missing MovieID Value");
                return;
            }
            url = `https://animehub-q89c.onrender.com/info/movies?keyw=${search}`;
            break;

        case "source-movies":
            if (!search || !id) {
                console.error("Missing episodeID or ID Value");
                return;
            }
            url = `https://animehub-q89c.onrender.com/source/movies?id=${id}&keyw=${search}`;
            break;

        case "recentMovies":
            url = 'https://animehub-q89c.onrender.com/recentMovies/movies';
            break;

        case "recentTvshows":
            url = 'https://animehub-q89c.onrender.com/recentTvshows/movies';
            break;

        case "trendingMovies":
            url = 'https://animehub-q89c.onrender.com/trendingMovies/movies';
            break;

        case "trendingTvshows":
            url = 'https://animehub-q89c.onrender.com/trendingTvshows/movies';
            break;

        default:
            console.error("Invalid settings value");
            return;
    }

    try {
        const response = await axios.get(url);
        const data = await response.data;
        if (settings === 'recent' || settings === 'popular' || settings === 'search' || settings === 'movies' || settings === 'top') {
            const final_data = [];
            data.forEach(function(i){
                i['serverType'] = 'parseAnime';
                final_data.push(i);
            })
            return final_data;
        } else if (settings === 'search-movies' || settings === 'recentMovies' || settings === 'recentTvshows' || settings === 'trendingMovies' || settings === 'trendingTvshows') {
            const final_data = [];
            data.forEach(function(o){
                o['serverType'] = 'parseMovies';
                final_data.push(o);
            })
            return final_data;
        }
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}















function saveSession (animeid, animeTitle, animeImg, episodeno, serverType) {

    fetch('https://system.saludeskimdev1.repl.co/activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverType === 'parseAnime' ? { "activity_type": "recent watch", "details": { "animeId": animeid, "animeTitle": animeTitle, "animeImg": animeImg, "episode_no": episodeno, "serverType": serverType } } : { "activity_type": "recent watch", "details": { "id": animeid, "title": animeTitle, "image": animeImg, "episode_no": episodeno, "serverType": serverType } } ),
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function getSession () {

    fetch('https://system.saludeskimdev1.repl.co/user_activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        const userdata = [];
        data.activity_logs.forEach(function(k) {
            userdata.push(JSON.parse(k[2]));
        })
        var imageContainerRecent = document.getElementById("image-container-recent-user");
        imageContainerRecent.innerHTML = "";
        parseAnime(userdata, imageContainerRecent, true);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
