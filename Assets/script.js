$(document).ready(function () {
  const API_KEY = "04b922ca5a7b6d7b99b0d85b1d7529d9";
  const cityNameInput = $("#cityName");
  const searchButton = $("#searchBtn");
  const forecastWeatherContainer = $("#forecastWeatherContainer");
  let cityData = localStorage.getItem("city");

  // stores JSON data as array for city buttons
  let buttons = [];
  if (cityData) {
    try {
      buttons = JSON.parse(cityData);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
    }
  }
  //creates the buttons for searched cities.
  function createCityButton(cityName) {
    const button = $("<button>")
      .addClass("btn btn-info card addcity")
      .text(cityName);
    searchButton.after(button);
    button.click(function () {
      cityNameInput.val(cityName);
      getWeather(cityName);
    });
  }
  buttons.forEach((cityName) => createCityButton(cityName));
  //saves the search cities as buttons, keeps only 5 after refreash
  function saveCity(cityName) {
    if (!buttons.includes(cityName)) {
      buttons.push(cityName);
      if (buttons.length > 5) {
        const removedCity = buttons.shift();
        $(`.addCity:contains(${removedCity})`).remove();
      }
      localStorage.setItem("city", JSON.stringify(buttons));
      createCityButton(cityName);
    }
  }
  {
    function updateCurrentWeather(weatherData) {
      const currentDate = new Date().toDateString();
      const windSpeed = (weatherData.wind.speed * 2.23694).toFixed(1);
      const temperature = Math.floor(
        ((weatherData.main.temp - 273.15) * 9) / 5 + 32
      );
      // Updates each element with the new weather data
      $("#currentDate").html(`<strong>${currentDate}</strong>`);
      $("#currentCity").text(weatherData.name);
      $("#currentTemp").text(`Temperature: ${temperature}°F`);
      $("#currentHumidity").text(`Humidity: ${weatherData.main.humidity}%`);
      $("#currentWind").text(`Wind: ${windSpeed} MPH`);
      $("#currentIcon")
        .attr(
          "src",
          `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`
        )
        .attr("alt", "Current Weather Icon");
      $("#currentDescription").text(weatherData.weather[0].description);
    }

    function updateForecast(forecastData) {
      forecastWeatherContainer.empty();
      // Process each days forecast for next 4 days
      for (let i = 7; i < 7 * 5; i += 7) {
        const forecast = forecastData.list[i];
        const date = new Date(forecast.dt_txt);
        const windSpeed = (forecast.wind.speed * 2.23694).toFixed(1);
        const humidity = forecast.main.humidity;
        const cardHtml = `<div class="col">
                    <div class="card bg-secondary p-3 text-white">
                        <div class="card-body">
                            <h5 class="card-title fw-semibold">${date.toDateString()}</h5>
                            <p class="card-text">${Math.floor(
                              ((forecast.main.temp - 273.15) * 9) / 5 + 32
                            )}°F</p>
                            <p class="card-text">Humidity: ${humidity}%</p>
                            <p class="card-text">Wind: ${windSpeed} MPH</p>
                            <img src="https://openweathermap.org/img/wn/${
                              forecast.weather[0].icon
                            }.png" alt="Weather icon" class="card-img-top">
                            <p class="card-text">${
                              forecast.weather[0].description
                            }</p>
                            </div>
                    </div>
                </div> `;
        forecastWeatherContainer.append(cardHtml);
      }
    }
    function getWeather(cityName) {
      const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}`;
      // Get current weather
      fetch(weatherURL)
        .then((response) => response.json())
        .then((data) => {
          if (data.cod !== 200) {
            throw new Error(data.message);
          }
          updateCurrentWeather(data);
        })
        .catch((error) => {
          console.error("Error getting current weather:", error);
        });
      // Get forecast
      fetch(forecastURL)
        .then((response) => response.json())
        .then((data) => {
          if (data.cod !== "200") {
            throw new Error(data.message);
          }
          updateForecast(data);
        })
        .catch((error) => {
          console.error("Error getting forecast:", error);
        });
    } // gives search button function
    searchButton.click(function () {
      const cityName = cityNameInput.val().trim();
      if (cityName) {
        saveCity(cityName);
        getWeather(cityName);
      } else {
        alert("Please enter city name.");
      }
    });
  }
});
