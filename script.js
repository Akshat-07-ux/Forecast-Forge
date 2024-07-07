let appId = '71f6779186cc32448b4c412eea65b982';
let units = 'metric';
let searchMethod;
let currentBackgroundImage;

const grantAccessButton = document.querySelector("[data-grantAccess]");
const messageText = document.querySelector("[data-messageText]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const currentWeatherContainer = document.getElementById('currentWeatherContainer');
const searchWeatherContainer = document.getElementById('searchWeatherContainer');

function getSearchMethod(searchTerm) {
    if(searchTerm.length === 5 && Number.parseInt(searchTerm) + '' === searchTerm)
        searchMethod = 'zip';
    else
        searchMethod = 'q';
}

function searchWeather(searchTerm) {
    getSearchMethod(searchTerm);
    fetch(`https://api.openweathermap.org/data/2.5/weather?${searchMethod}=${searchTerm}&APPID=${appId}&units=${units}`)
        .then((result) => {
            return result.json();
        }).then((res) => {
            init(res);
    });

    fetch(`https://api.openweathermap.org/data/2.5/forecast?${searchMethod}=${searchTerm}&APPID=${appId}&units=${units}`)
        .then((result) => {
            return result.json();
        }).then((res) => {
            updateForecast(res);
    });
}

function getBackgroundImage(weatherMain) {
    switch (weatherMain) {
        case 'Clear':
            return "url('images/clearPicture.jpg')";
        case 'Clouds':
            return "url('images/cloudyPicture.jpg')";
        case 'Rain':
        case 'Drizzle':
            return "url('images/rainPicture.jpg')";
        case 'Mist':
            return "url('images/mistPicture.jpg')";
        case 'Haze':  
            return "url('images/haze.jpg')";
        case 'Thunderstorm':
            return "url('images/stormPicture.jpg')";
        case 'Snow':
            return "url('images/snowPicture.jpg')";
        default:
            return "url('images/defaultPicture.jpg')";
    }
}

function init(resultFromServer) {
    document.body.style.backgroundImage = getBackgroundImage(resultFromServer.weather[0].main);

    let weatherDescriptionHeader = document.getElementById('weatherDescriptionHeader');
    let temperatureElement = document.getElementById('temperature');
    let humidityElement = document.getElementById('humidity');
    let windSpeedElement = document.getElementById('windSpeed');
    let cityHeader = document.getElementById('cityHeader');
    let weatherIcon = document.getElementById('documentIconImg');

    weatherIcon.src = 'https://openweathermap.org/img/w/' + resultFromServer.weather[0].icon + '.png';

    let resultDescription = resultFromServer.weather[0].description;
    weatherDescriptionHeader.innerText = resultDescription.charAt(0).toUpperCase() + resultDescription.slice(1);
    temperatureElement.innerHTML = Math.floor(resultFromServer.main.temp) + '&#176;';
    windSpeedElement.innerHTML = 'Wind Speed: ' + Math.floor(resultFromServer.wind.speed) + ' meter/s';
    cityHeader.innerHTML = resultFromServer.name;
    humidityElement.innerHTML = 'Humidity levels: ' + resultFromServer.main.humidity +  '%';

    setPositionForWeatherInfo();
}

function updateForecast(resultFromServer) {
    const forecastDays = [resultFromServer.list[8], resultFromServer.list[16], resultFromServer.list[24]];

    forecastDays.forEach((day, index) => {
        document.getElementById(`date-${index + 1}`).innerText = new Date(day.dt * 1000).toDateString();
        document.getElementById(`temp-${index + 1}`).innerText = `${Math.floor(day.main.temp)} °C`;
        document.getElementById(`description-${index + 1}`).innerText = day.weather[0].description;
        document.getElementById(`icon-${index + 1}`).src = `https://openweathermap.org/img/w/${day.weather[0].icon}.png`;
    });
}

function setPositionForWeatherInfo() {
    searchWeatherContainer.style.visibility = 'visible';
}

document.getElementById('searchBtn').addEventListener('click', () => {
    let searchTerm = document.getElementById('searchInput').value;
    if(searchTerm)
        searchWeather(searchTerm);
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByCoords(lat, lon);
            },
            (error) => {
                messageText.textContent = "You denied the request for Geolocation. Please allow access to see weather information.";
            }
        );
    } else {
        messageText.textContent = "Geolocation is not supported by this browser.";
    }
}

function fetchWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${appId}&units=${units}`)
        .then((result) => {
            return result.json();
        }).then((res) => {
            initCurrentWeather(res);
        });
}

function initCurrentWeather(resultFromServer) {
    currentBackgroundImage = getBackgroundImage(resultFromServer.weather[0].main);
    currentWeatherContainer.style.backgroundImage = currentBackgroundImage;
    document.body.style.backgroundImage = currentBackgroundImage;

    let weatherDescriptionHeader = document.getElementById('currentWeatherDescriptionHeader');
    let temperatureElement = document.getElementById('currentTemperature');
    let humidityElement = document.getElementById('currentHumidity');
    let windSpeedElement = document.getElementById('currentWindSpeed');
    let cityHeader = document.getElementById('currentCityHeader');
    let weatherIcon = document.getElementById('currentDocumentIconImg');

    weatherIcon.src = 'https://openweathermap.org/img/w/' + resultFromServer.weather[0].icon + '.png';

    let resultDescription = resultFromServer.weather[0].description;
    weatherDescriptionHeader.innerText = resultDescription.charAt(0).toUpperCase() + resultDescription.slice(1);
    temperatureElement.innerHTML = Math.floor(resultFromServer.main.temp) + '&#176;';
    windSpeedElement.innerHTML = 'Wind Speed: ' + Math.floor(resultFromServer.wind.speed) + ' meter/s';
    cityHeader.innerHTML = resultFromServer.name;
    humidityElement.innerHTML = 'Humidity levels: ' + resultFromServer.main.humidity +  '%';

    currentWeatherContainer.style.display = 'block';
    grantAccessContainer.style.display = 'none';
}

grantAccessButton.addEventListener("click", getLocation);

document.getElementById('searchBtn').addEventListener('click', () => {
    let searchTerm = document.getElementById('searchInput').value;
    if(searchTerm) {
        searchWeather(searchTerm);
        // Keep the current weather container's background unchanged
        currentWeatherContainer.style.backgroundImage = currentBackgroundImage;
    }
});