const URI = "https://api.openweathermap.org/data/2.5/";
const KEY = "99f3735d1d2e7b6bf92be0d56bbb8115";
// current city data (Memphis, TN by default)
let currentCity = "Memphis";
let currentState = "TN";
let currentLat = 35.15;
let currentLong = -90.05;
let currentOffset = -21600;

// start the page with weather for Memphis, TN
update(currentCity, currentState, currentLat, currentLong, currentOffset);

// update the weather every 15 minutes
setInterval(
  function() {
    update(currentCity, currentState, currentLat, currentLong, currentOffset);
  },
  15*60000);

// listen for the user to input a city and state
let form = document.getElementById("form");
form.addEventListener("submit", getPlace);

// update everything on the page
function update(city, state, lat, long, offset) {
  displayDate();
  displayLocation(city, state);
  getWeather(lat, long, offset);
}

// fetch the lat/long and time offset for a location,
// then display the weather for that place
function getPlace(event) {
  let error = document.getElementById("error");
  error.textContent = "";
  
  // get the city and state from user input
  let city = form.elements[0].value;
  let state = form.elements[1].value;

  // call the API for the city and state
  fetch(`${URI}weather?q=${city},${state},US&appid=${KEY}`)
  .then((res) => {
    return res.json();
  }).then((data) => {
    // if the city is not found, display a message
    if (data.message === "city not found") {
      error.textContent = "City not found.";
    } else {
      // display the date and location, and fetch weather
      displayDate();
      displayLocation(city, state);
      let lon = data.coord.lon;
      let lat = data.coord.lat;
      let timeOffset = data.timezone;
      getWeather(lat, lon, timeOffset);

      // update current city so that the refresh shows that information
      currentCity = city;
      currentState = state;
      currentLong = lon;
      currentLat = lat;
      currentOffset = timeOffset;
    }
  });
  
  // clear out the form and prevent the page from reloading
  form.elements[0].value = "";
  event.preventDefault();
}

// called by getPlace()
// fetch the current and daily forecast for a location
function getWeather(lat, lon, timeOffset) {
  // fetch the current and daily forecasts
  fetch(`${URI}onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=${"minutely,hourly,alerts"}&appid=${KEY}`)
  .then((res) => {
    return res.json();
  }).then((data) => {
    // act on the data
    currentTemp(data.current);
    displayForecast(data.daily, timeOffset);
  });
}

// called by getPlace()
// display the current city and state
function displayLocation(city, state) {
  let cityText = document.getElementById("city-text");
  cityText.textContent = city;
  let stateText = document.getElementById("state-text");
  stateText.textContent = state;
}

// getPlace() -> getWeather -> currentTemp()
// display current temperature and feels like for a place
function currentTemp(current) {
  let temp = document.getElementById("temp-text");
  let feelsLike = document.getElementById("feels-like");

  // display current temperature in F
  let tempF = current.temp;
  temp.textContent = tempF;

  // display feels-like temperature in F
  tempF = current.feels_like;
  feelsLike.textContent = tempF;
}

// getplace() -> getWeather -> displayForecast
// display the 7-day temperatures for a place
function displayForecast(daily, timeOffset) {
  for (let i = 0; i < 7; i++) {
    displayDaily(daily[i], i, timeOffset);
  } 
}

// getPlace() -> getWeather -> displayForecast -> displayDaily
// display the one-day forecast for a place
function displayDaily(cast, index, timeOffset) {
  let li = document.getElementById(`day-${index}`);
  let date = li.getElementsByClassName("date")[0];
  let min = li.getElementsByClassName("min")[0];
  let max = li.getElementsByClassName("max")[0];

  let currentTime = new Date((cast.dt + timeOffset)*1000);
  let weekDay = currentTime.toLocaleString("en-US", {weekday: "short"});
  let month = currentTime.toLocaleString("en-US", {month: "short"});
  let day = currentTime.toLocaleString("en-US", {day: "numeric"});

  date.textContent = `${weekDay}, ${month} ${day}`;
  min.textContent = Math.round(cast.temp.min);
  max.textContent = Math.round(cast.temp.max);
}

// display the current date and time
function displayDate() {
  let date = document.getElementById("date");
  var d = new Date();
  formattedDate = `${d.toDateString()} ${d.getHours()}:${d.getMinutes()}`;
  date.textContent = formattedDate;
}
