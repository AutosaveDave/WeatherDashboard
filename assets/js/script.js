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
const todayUV = document.getElementById('today-uvIndex');
const forecastSection = document.getElementById('forecast-section');
const fiveDay = document.getElementById('five-day');
const apiBaseUrl = 'https://api.openweathermap.org/data/3.0/onecall?';
const apiKey = 'e59b3d92d7636ac0a4b04dc1ab3a0031';
const apiKey2 = '55279e501fb36a6d703f3500eb0ea640';
const iconBaseUrl = 'https://openweathermap.org/img/w/'

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

let currentCity = '';


// Update page with appropriate information based on city search term
function submitSearch(submitEvent){
    submitEvent.preventDefault();
    const searchText = citySearch.value;
    console.log(searchText);
    getCoords(searchText);
}

// Get coordinates from city search term
function getCoords(searchTerm) {
    const coordsApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q='+searchTerm+'&limit=5&appid='+apiKey2;
    fetch(coordsApiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if(data[0]) {
                console.log(data[0]);
                const lattitude = data[0].lat;
                const longitude = data[0].lon;
                currentCity = searchTerm;
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
    newEl.addEventListener('click', historyClick);
}

function renderHistoryBtns() {
    historyCount = parseInt(localStorage.getItem('weatherHistory-count'));
    if(!historyCount){
        localStorage.setItem('weatherHistory-count', "" + 0);
        historyCount = 0;
    } else if(historyCount > 0) {
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
            newEl.setAttribute('data-city', ""+city);
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
    currentCity = clickEvent.target.getAttribute('data-city');
    getWeather(lat, lon);
}

// Get weather info from API using lat/lon coorinates
function getWeather(lat, lon) {
    const weatherApiUrl = `${apiBaseUrl}lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}`;
    fetch(weatherApiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            console.log(data);
            renderToday(data);
            renderFiveday(data);
        })
        .catch(function (err) {
            console.log(err);
        })
}

function renderToday(data){
    const date = dayjs().tz(data.timezone).format('M/D/YYYY');
    cityName.textContent = currentCity;
    todayIcon.src = iconBaseUrl + data.current.weather[0].icon + '.png';
    todayDate.textContent = date;
    todayTemp.textContent = data.current.temp;
    todayWind.textContent = data.current.wind_speed;
    todayHumidity.textContent = data.current.humidity;
    const UVi = data.current.uvi;
    todayUV.textContent = '' + UVi;
    todayUV.setAttribute('class', uvColorClass(UVi));
}

function uvColorClass(uv) {
    const otherClasses = ' align-middle'
    if(uv <= 2) {
        return 'uv-favorable' + otherClasses;
    } else if(uv <= 5) {
        return 'uv-moderate' + otherClasses;
    } else if(uv <= 7) {
        return 'uv-severe' + otherClasses;
    } else if(uv <= 10) {
        return 'uv-real-bad' + otherClasses;
    } else {
        return 'uv-mad-max' + otherClasses;
    }
}

// Loop through next five days and render info to 5-day forecast
function renderFiveday(data){
    // Clear any existing fiveday forecast cards
    while(fiveDay.firstChild) {
        fiveDay.firstChild.remove();
    }

    let date, icon, imgUrl, temp, wind, humidity, cardEl, iconEl, tempEl, windEl, humEl;
    for(let a = 1; a <= 5; a++) {
        date = dayjs().add(a, 'day').tz(data.timezone).format('M/D/YYYY');
        icon = data.daily[a].weather[0].icon;
        imgUrl = iconBaseUrl + icon + '.png';
        temp = data.daily[a].temp.day;
        wind = data.daily[a].wind_speed;
        humidity = data.daily[a].humidity;

        cardEl = document.createElement('div');
        cardEl.setAttribute('class', 'col-2 fiveday-card ');
        dateEl = document.createElement('p');
        dateEl.setAttribute('class', 'fiveday-date');
        iconEl = document.createElement('img');
        iconEl.setAttribute('class', 'fiveday-icon');
        iconEl.setAttribute('src', imgUrl);
        tempEl = document.createElement('p');
        windEl = document.createElement('p');
        humEl = document.createElement('p');

        fiveDay.append(cardEl);
        cardEl.append(dateEl, iconEl, tempEl, windEl, humEl);

        dateEl.textContent = date;
        tempEl.textContent = 'Temp: ' + temp + '°F';
        windEl.textContent = 'Wind: ' + wind + ' MPH';
        humEl.textContent = 'Humidity: ' + humidity + '%';
    }
}

renderHistoryBtns();

// Listen for clicks on city search button
citySearchForm.addEventListener('submit', submitSearch);