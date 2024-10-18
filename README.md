# Weather Dashboard

## Deployed @ https://hashir-ayaz.github.io/Weather-Dashboard-with-Chatbot/

## Overview

This project is a fully functional **Weather Dashboard** built using HTML, CSS, and JavaScript. The dashboard displays current weather information and a 5-day weather forecast for any city entered by the user. It also includes additional features such as unit conversion (Celsius to Fahrenheit), geolocation-based weather retrieval, loading spinners, error handling, and animations for a more interactive user experience.

## Features

### 1. Current Weather Information:

- Displays the current weather for a selected city, including temperature, humidity, wind speed, and weather conditions.
- Retrieves data using the **OpenWeather API**.

### 2. 5-Day Forecast:

- Provides a 5-day forecast for the selected city, including temperatures, weather conditions, and other details.
- The forecast is displayed in both graphical (charts) and textual formats.

### 3. Unit Conversion:

- Allows users to toggle between **Celsius** and **Fahrenheit** for temperature display using a switch button.

### 4. Geolocation Support:

- Automatically detects the user's current location and displays the weather for that location on load, using the **Geolocation API**.

### 5. Loading Spinner:

- A loading spinner is shown while waiting for the weather API responses to give feedback to the user that the app is processing data.

### 6. Error Handling:

- Handles invalid city names or API errors by showing error messages.
- Displays a fallback weather icon or message in case of incomplete data.

### 7. CSS Animations:

- Weather icons and charts have simple fade-in animations to enhance the user experience.
- Buttons and elements have interactive hover and click effects for smooth navigation.

## Files Included

1. **HTML File (`index.html`)**
   - The main structure and layout of the weather dashboard.
   - Contains the search input, toggle for temperature units, and sections for displaying weather data and charts.
2. **CSS File (`styles.css`)**

   - Contains all the styles for the weather dashboard, including animations, layout, and responsive design.

3. **JavaScript File (`dashboard.js`)**

   - Contains the logic to fetch weather data from the OpenWeather API.
   - Implements geolocation support, unit conversion toggle, error handling, and chart generation using **Chart.js**.

4. **README File (`README.md`)**
   - This file that provides instructions for setting up and running the project locally.

## Instructions to Run the Project Locally

Open the index.html file
Right Click and open in chrome!
