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

const makeVerticalBarChart = (data) => {
  const ctx = document.getElementById("vertical-bar-chart").getContext("2d");

  // Destroy previous chart instance if it exists
  if (verticalBarChartInstance) {
    verticalBarChartInstance.destroy();
  }

  const labels = data.list
    .map((item) => new Date(item.dt_txt).toLocaleDateString())
    .slice(0, 5);
  const temperatures = data.list
    .map((item) => Math.round(item.main.temp - 273.15))
    .slice(0, 5);

  verticalBarChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
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

const makeLineChart = (data) => {
  const ctx = document.getElementById("line-chart").getContext("2d");

  // Destroy previous chart instance if it exists
  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  const labels = data.list
    .map((item) => new Date(item.dt_txt).toLocaleDateString())
    .slice(0, 5);
  const temperatures = data.list
    .map((item) => Math.round(item.main.temp - 273.15))
    .slice(0, 5);

  lineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.1,
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

  // Save the city name and forecast data into localStorage
  localStorage.setItem("cityName", cityName);
  localStorage.setItem("fiveDayForecast", JSON.stringify(FiveDayForecastData));

  // Access the first element with the class 'weather-data'
  const weatherDataDiv = document.getElementsByClassName("weather-data")[0];

  // Determine the weather condition
  const weatherCondition = weatherData.weather[0].main.toLowerCase();

  // Map weather conditions to corresponding background images
  let backgroundImage = "";

  switch (weatherCondition) {
    case "clear":
      backgroundImage = "assets/clear-sky.jpg";
      break;
    case "clouds":
      if (weatherData.weather[0].description.includes("few")) {
        backgroundImage = "assets/few-clouds.jpg";
      } else if (weatherData.weather[0].description.includes("scattered")) {
        backgroundImage = "assets/scattered-clouds.jpg";
      } else {
        backgroundImage = "assets/cloudy.jpg";
      }
      break;
    case "rain":
      backgroundImage = "assets/rain.jpg";
      break;
    case "thunderstorm":
      backgroundImage = "assets/thunderstorm.jpg";
      break;
    case "snow":
      backgroundImage = "assets/snow.jpg";
      break;
    case "mist":
    case "haze":
    case "fog":
      backgroundImage = "assets/mist.jpg";
      break;
    default:
      backgroundImage = "assets/clear-sky.jpg"; // Default to clear sky if condition not found
  }

  // Set the background image of the weather widget
  weatherDataDiv.style.backgroundImage = `url(${backgroundImage})`;
  weatherDataDiv.style.backgroundSize = "cover";
  weatherDataDiv.style.backgroundPosition = "center";
  weatherDataDiv.style.color = "#fff"; // Change text color for better visibility on images
  weatherDataDiv.style.padding = "20px"; // Add padding for better layout

  // Display user's input and the weather data in the weather widget
  weatherDataDiv.innerHTML = `
    <h3>Weather for: ${cityName}</h3>
    <p>Condition: ${weatherData.weather[0].description}</p>
    <p>Temperature: ${Math.round(weatherData.main.temp - 273.15)} °C</p>
    <p>Humidity: ${weatherData.main.humidity}%</p>
    <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
  `;

  makeVerticalBarChart(FiveDayForecastData);
  makeDoughnutChart(FiveDayForecastData);
  makeLineChart(FiveDayForecastData);
};
