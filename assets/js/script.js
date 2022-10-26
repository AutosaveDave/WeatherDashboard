// ------------------------HTML ELEMENTS
const citySearch = document.getElementById('city-search');
const citySearchBtn = document.getElementById('city-search-btn');
const citySearchForm = document.getElementById('city-search-form');
const historySection = document.getElementById('history-section');
const todaySection = document.getElementById('today-section');
const cityName = document.getElementById('city-name');
const todayIcon = document.getElementById('today-icon');
const todayDate = document.getElementById('today-date');
const todayTemp = document.getElementById('today-temp');
const todayWind = document.getElementById('today-wind');
const todayHumidity = document.getElementById('today-humidity');
const forecastSection = document.getElementById('forecast-section');
const fiveDay = document.getElementById('five-day');
const apiBaseUrl = 'https://api.openweathermap.org/data/2.5/onecall?';
const apiKey = '55279e501fb36a6d703f3500eb0ea640';

// Update page with appropriate information based on city search term
function submitSearch(submitEvent){
    submitEvent.preventDefault();
    const searchText = citySearch.value;
    console.log(searchText);
    getCoords(searchText);

    
}

// Get coordinates from city search term
function getCoords(searchTerm) {
    const coordsApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q='+searchTerm+'&limit=5&appid='+apiKey;
    fetch(coordsApiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if(data[0]) {
                console.log(data[0]);
                lattitude = data[0].lat;
                longitude  = data[0].lon;
                addHistoryBtn(searchTerm, lattitude, longitude);
                getWeather(lattitude, longitude);
            } else {
                alert('Location not found!');
            }
        })
        .catch(function (err) {
            console.error(err);
          });
}

function addHistoryBtn(city, lat, lon) {
    historyCount = parseInt(localStorage.getItem('weatherHistory-count'));
    if(!historyCount){
        localStorage.setItem(`weatherHistory-count`, "" + 0);
        historyCount = 0;
    }
    historyCount +=1 ;
    localStorage.setItem(`weatherHistory-count`, "" + historyCount);
    localStorage.setItem(`weatherHistory-${historyCount}`, city);
    localStorage.setItem(`weatherHistory-lat-${historyCount}`, lat);
    localStorage.setItem(`weatherHistory-lon-${historyCount}`, lon);
    const newEl = document.createElement('button');
    newEl.setAttribute('class', 'btn historyBtn');
    newEl.setAttribute('data-lat', ""+lat);
    newEl.setAttribute('data-lon', ""+lon);
    newEl.value = city;
    newEl.textContent = city;
    historySection.append(newEl);
}

function renderHistoryBtns() {
    historyCount = parseInt(localStorage.getItem('weatherHistory-count'));
    if(!historyCount){
        localStorage.setItem('weatherHistory-count', "" + 0);
        historyCount = 0;
    } else if(historyCount > 0) {
        localStorage.clear();
        while(historySection.firstChild){
            historySection.firstChild.removeEventListener('click',historyClick);
            historySection.firstChild.remove();
        }
        let city, lat, lon, newEl;
        for(let a = 1; a <= historyCount; a++){
            city = localStorage.getItem('weatherHistory-' + a);
            lat = localStorage.getItem('weatherHistory-lat-' + a);
            lon = localStorage.getItem('weatherHistory-lon-' + a);
            newEl = document.createElement('button');
            newEl.setAttribute('class', 'btn historyBtn');
            newEl.setAttribute('data-lat', ""+lat);
            newEl.setAttribute('data-lon', ""+lon);
            newEl.value = city;
            newEl.textContent = city;
            historySection.append(newEl);
            newEl.addEventListener('click', historyClick);
        }
    }
}

function historyClick(clickEvent) {
    const lat = clickEvent.target.getAttribute('data-lat');
    const lon = clickEvent.target.getAttribute('data-lon');
    getWeather(lat, lon);
}

// Get weather info from API using lat/lon coorinates
function getWeather(lat, lon) {
    console.log(lat);
    console.log(lon);
    const weatherApiUrl = `${apiBaseUrl}lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`;
    fetch(weatherApiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            console.log(data);
            renderToday();
            renderFiveday();
        })
        .catch(function (err) {
            console.log(err);
        })
}

function renderToday(){

}

function renderFiveday(){

}

renderHistoryBtns();

// Listen for clicks on city search button
citySearchForm.addEventListener('submit', submitSearch);