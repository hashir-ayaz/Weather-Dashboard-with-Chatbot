// import { Chart, registerables } from "chart.js";

// // This ensures all chart types (bar, line, doughnut, etc.) are registered
// Chart.register(...registerables);

const OPENWEATHER_API_KEY = "df72bc542515686f5bc75690d41f1031";

let verticalBarChartInstance = null;
let doughnutChartInstance = null;
let lineChartInstance = null;

const fetchWeatherData = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${OPENWEATHER_API_KEY}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

const fetch5DayForecast = async (cityName) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

let isCelsius = true; // Default temperature unit

// Function to toggle the unit between Celsius and Fahrenheit
const toggleUnit = () => {
  isCelsius = !isCelsius;
  // Re-fetch data to update the UI with the correct temperature unit
  handleSearch();
};

// Convert temperature based on the selected unit
const convertTemperature = (kelvinTemp) => {
  const celsiusTemp = kelvinTemp - 273.15;
  return isCelsius
    ? Math.round(celsiusTemp)
    : Math.round((celsiusTemp * 9) / 5 + 32);
};

// Modify the charts and display functions to use `convertTemperature()`

const makeVerticalBarChart = (data) => {
  const ctx = document.getElementById("vertical-bar-chart").getContext("2d");

  if (verticalBarChartInstance) {
    verticalBarChartInstance.destroy();
  }

  const labels = data.list
    .map((item) => new Date(item.dt_txt).toLocaleDateString())
    .slice(0, 5);
  const temperatures = data.list
    .map((item) => convertTemperature(item.main.temp))
    .slice(0, 5);

  verticalBarChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Temperature (${isCelsius ? "°C" : "°F"})`,
          data: temperatures,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

const makeLineChart = (data) => {
  const ctx = document.getElementById("line-chart").getContext("2d");

  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  const labels = data.list
    .map((item) => new Date(item.dt_txt).toLocaleDateString())
    .slice(0, 5);
  const temperatures = data.list
    .map((item) => convertTemperature(item.main.temp))
    .slice(0, 5);

  lineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Temperature (${isCelsius ? "°C" : "°F"})`,
          data: temperatures,
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false,
        },
      ],
    },
  });
};

const handleSearch = async () => {
  const cityName = document.getElementById("cityInput").value;
  const weatherData = await fetchWeatherData(cityName);
  const FiveDayForecastData = await fetch5DayForecast(cityName);
  console.log(weatherData);

  localStorage.setItem("cityName", cityName);
  localStorage.setItem("fiveDayForecast", JSON.stringify(FiveDayForecastData));

  const weatherDataDiv = document.getElementsByClassName("weather-data")[0];

  const weatherCondition = weatherData.weather[0].main.toLowerCase();
  let backgroundImage = "";

  switch (weatherCondition) {
    case "clear":
      backgroundImage = "assets/clear-sky.jpg";
      break;
    case "clouds":
      backgroundImage = "assets/cloudy.jpg";
      break;
    case "rain":
      backgroundImage = "assets/rain.jpg";
      break;
    default:
      backgroundImage = "assets/clear-sky.jpg";
  }

  weatherDataDiv.style.backgroundImage = `url(${backgroundImage})`;
  weatherDataDiv.style.backgroundSize = "cover";
  weatherDataDiv.style.backgroundPosition = "center";
  weatherDataDiv.style.color = "#fff";
  weatherDataDiv.style.padding = "20px";

  const temperature = convertTemperature(weatherData.main.temp);

  weatherDataDiv.innerHTML = `
    <h3>Weather for: ${cityName}</h3>
    <p>Condition: ${weatherData.weather[0].description}</p>
    <p>Temperature: ${temperature} °${isCelsius ? "C" : "F"}</p>
    <p>Humidity: ${weatherData.main.humidity}%</p>
    <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
  `;

  makeVerticalBarChart(FiveDayForecastData);
  makeDoughnutChart(FiveDayForecastData);
  makeLineChart(FiveDayForecastData);
};

const makeDoughnutChart = (data) => {
  const ctx = document.getElementById("doughnut-chart").getContext("2d");

  // Destroy previous chart instance if it exists
  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  const conditionCounts = {};
  data.list.slice(0, 5).forEach((item) => {
    const condition = item.weather[0].main;
    conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
  });

  const labels = Object.keys(conditionCounts);
  const values = Object.values(conditionCounts);

  doughnutChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Weather Conditions",
          data: values,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
} else {
  alert("Geolocation is not supported by your browser.");
}

function successCallback(position) {
  const { latitude, longitude } = position.coords;
  console.log("Your Location: ", latitude, longitude);

  // Call the weather API with the user's latitude and longitude
  fetchWeatherByLocation(latitude, longitude);
}

function errorCallback(error) {
  console.error("Error getting location: ", error.message);
}

const fetchWeatherByLocation = async (latitude, longitude) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Weather data for your location: ", data);
    displayWeatherData(data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

const displayWeatherData = (data) => {
  const weatherDataDiv = document.getElementsByClassName("weather-data")[0];
  const temperature = Math.round(data.main.temp - 273.15); // Convert from Kelvin to Celsius
  weatherDataDiv.innerHTML = `
    <h3>Weather for Your Location</h3>
    <p>Condition: ${data.weather[0].description}</p>
    <p>Temperature: ${temperature} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
};

window.onload = () => {
  // Check if Geolocation is supported
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Fetch weather based on user's location
        fetchWeatherByLocation(latitude, longitude);
      },
      (error) => {
        console.error("Error fetching geolocation: ", error.message);
        // Optionally, show default weather for a city if geolocation fails
        fetchWeatherData("New York"); // Default to New York if location is unavailable
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
    // Show default weather if geolocation is not supported
    fetchWeatherData("New York");
  }
};
