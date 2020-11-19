const URI = "https://api.openweathermap.org/data/2.5/";
const KEY = "99f3735d1d2e7b6bf92be0d56bbb8115";
// current city data (Memphis, TN by default)
let currentCity = "Memphis";
let currentState = "TN";
let currentLat = 35.15;
let currentLong = -90.05;
let currentOffset = 0;

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
  displayDate(offset);
  displayLocation(city, state);
  getWeather(lat, long);
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
      let offset = data.timezone;
      displayDate(offset);
      displayLocation(city, state);
      let lon = data.coord.lon;
      let lat = data.coord.lat;
      getWeather(lat, lon);

      // update current city so that the refresh shows that information
      currentOffset = offset;
      currentCity = city;
      currentState = state;
      currentLong = lon;
      currentLat = lat;
    }
  });
  
  // clear out the form and prevent the page from reloading
  form.elements[0].value = "";
  event.preventDefault();
}


// called by getPlace()
// display the current city and state
function displayLocation(city, state) {
  let cityText = document.getElementById("city-text");
  cityText.textContent = city;
  let stateText = document.getElementById("state-text");
  stateText.textContent = state;
}

// called by getPlace()
// fetch the current and daily forecast for a location
function getWeather(lat, lon) {
  // fetch the current and daily forecasts
  fetch(`${URI}onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=${"minutely,hourly,alerts"}&appid=${KEY}`)
  .then((res) => {
    return res.json();
  }).then((data) => {
    // act on the data
    currentTemp(data.current);
    displayForecast(data.daily, data.timezone_offset);
  });
}


// getPlace() -> getWeather -> currentTemp()
// display current temperature and feels like for a place
function currentTemp(current) {
  let temp = document.getElementById("temp-text");
  let feelsLike = document.getElementById("feels-like");

  // display current temperature in F
  let tempF = current.temp;
  temp.textContent = Math.round(tempF);

  // display feels-like temperature in F
  tempF = current.feels_like;
  feelsLike.textContent = Math.round(tempF);
}

// getplace() -> getWeather -> displayForecast
// display the 7-day temperatures for a place
function displayForecast(daily, offset) {
  let currentHigh = document.getElementById("current-high");
  let currentLow = document.getElementById("current-low");

  let high = daily[0].temp.max;
  let low = daily[0].temp.min;

  currentHigh.textContent = Math.round(high);
  currentLow.textContent = Math.round(low);

  for (let i = 1; i < 7; i++) {
    displayDaily(daily[i], i, offset);
  } 
}

// getPlace() -> getWeather -> displayForecast -> displayDaily
// display the one-day forecast for a place
function displayDaily(cast, index, offset) {
  let card = document.getElementById(`day-${index}`);
  let date = card.getElementsByClassName("date")[0];
  let min = card.getElementsByClassName("min")[0];
  let max = card.getElementsByClassName("max")[0];
  let sunrise = card.getElementsByClassName("sunrise")[0];
  let sunset = card.getElementsByClassName("sunset")[0];

  let utc = cast.dt;
  let currentDate = formatWeekday(offset, utc);
  let sunup = formatWeektime(offset, cast.sunrise);
  let sundown = formatWeektime(offset, cast.sunset);

  date.textContent = currentDate;
  min.textContent = Math.round(cast.temp.min);
  max.textContent = Math.round(cast.temp.max);
  sunrise.textContent = sunup;
  sunset.textContent = sundown;
}

// display correct time zone date and time
function convertDate(offset = 0, utc = 0) {
  var d = new Date();

  if (offset !== 0 && utc === 0) {
    // current nonlocal time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    d = new Date(utc + 1000 * offset);
  } else if (offset !== 0 && utc !== 0) {
    // sunrise/sunset
    let shift = 1000 * offset + (d.getTimezoneOffset() * 60000);
    d = new Date(utc * 1000 + shift);
  }

  return d;

}

function displayDate(offset) {
  let date = document.getElementById("date");

  let d = convertDate(offset);

  formattedDate = d.toLocaleString("en-US" , {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute:"2-digit",
    hour12: true
  });

  date.textContent = formattedDate;
}

function formatWeekday(offset, utc) {
  let d = convertDate(offset, utc);

  return d.toLocaleString("en-US", {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric'
  });
}

function formatWeektime(offset, utc) {
  let d = convertDate(offset, utc);

  return d.toLocaleTimeString("en-US",
  {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}