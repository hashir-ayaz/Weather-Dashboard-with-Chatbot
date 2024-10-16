const GEMINI_API_KEY = "AIzaSyD1s-4BHK912pfsgXEIiIRn7rAD8J1yX2k";

// Store conversation history (both user and model messages)
let conversationHistory = [
  {
    role: "user", // System role to set context for the bot
    parts: [
      {
        text: "You are a helpful chatbot that answers questions about the weather. Please assist the user with any weather-related queries. keep your answers brief and informative.",
      },
    ],
  },
];

// Function to send a message to the Gemini API
const sendMessageToGemini = async () => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: conversationHistory, // Send the full conversation history
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data; // Return the API response
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

// Function to handle sending a message
const handleSendMessage = async () => {
  const message = document.getElementById("chat-input").value; // Get the user input
  if (!message) return; // Don't send empty messages

  // Append the user's message to the conversation history
  conversationHistory.push({
    role: "user",
    parts: [{ text: message }],
  });

  // Append the user's message to the answer-area
  appendMessageToAnswerArea("user", message);

  // Send the conversation history (including the new user message) to Gemini API
  const response = await sendMessageToGemini();

  // Extract the model's response from the response object
  const modelMessage =
    response?.candidates[0]?.content?.parts[0]?.text ||
    "No response from Gemini.";

  // Append the model's message to the conversation history
  conversationHistory.push({
    role: "model",
    parts: [{ text: modelMessage }],
  });

  // Append the model's response to the answer-area
  appendMessageToAnswerArea("model", modelMessage);

  // Clear the chat input field after sending the message
  document.getElementById("chat-input").value = "";
};

// Function to append messages to the answer-area
const appendMessageToAnswerArea = (role, text) => {
  const answerArea = document.querySelector(".answer-area");

  // Create a new div for the message
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  // Add a different style depending on the role (user or model)
  messageDiv.innerHTML = `<strong>${
    role === "user" ? "You" : "Gemini"
  }:</strong> ${text}`;

  // Append the message to the answer-area
  answerArea.appendChild(messageDiv);

  // Scroll to the bottom to show the most recent message
  answerArea.scrollTop = answerArea.scrollHeight;
};

const rowsPerPage = 10; // Number of rows per page
let currentPage = 1;
let originalForecastList = []; // To store the original data for filtering
let filteredForecastList = []; // Store the current filtered/sorted list

// Function to display city name
const displayCityName = () => {
  const savedCityName = localStorage.getItem("cityName");
  const cityHeading = document.getElementById("city-heading");

  if (savedCityName) {
    cityHeading.innerText = `Weather Information for ${savedCityName}`;
  } else {
    cityHeading.innerText = `No city selected`;
  }
};

// Create the forecast table based on current page and filtered data
const createForecastTable = (page = 1, forecastList = filteredForecastList) => {
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const table = document.createElement("table");
  table.classList.add("forecast-table");

  const headerRow = document.createElement("tr");
  const headers = [
    "Date & Time",
    "Temperature (°C)",
    "Condition",
    "Wind Speed (m/s)",
    "Humidity (%)",
  ];

  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Paginated forecast data
  forecastList.slice(startIndex, endIndex).forEach((forecast) => {
    const row = document.createElement("tr");

    const dateTime = forecast.dt_txt;
    const temperature = Math.round(forecast.main.temp - 273.15); // Convert Kelvin to Celsius
    const condition = forecast.weather[0].description;
    const windSpeed = forecast.wind.speed;
    const humidity = forecast.main.humidity;

    const data = [
      dateTime,
      `${temperature} °C`,
      condition,
      `${windSpeed} m/s`,
      `${humidity} %`,
    ];

    data.forEach((item) => {
      const td = document.createElement("td");
      td.textContent = item;
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = ""; // Clear previous table
  tableContainer.appendChild(table);

  addPaginationControls(forecastList.length);
};

// Add pagination controls
const addPaginationControls = (totalRows) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginationContainer = document.createElement("div");
  paginationContainer.classList.add("pagination-controls");

  // Clear previous pagination controls
  const previousControls = document.querySelector(".pagination-controls");
  if (previousControls) {
    previousControls.remove();
  }

  // Add Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => changePage(currentPage - 1);
  paginationContainer.appendChild(prevButton);

  // Add page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    if (currentPage === i) {
      pageButton.classList.add("active-page");
    }
    pageButton.onclick = () => changePage(i);
    paginationContainer.appendChild(pageButton);
  }

  // Add Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => changePage(currentPage + 1);
  paginationContainer.appendChild(nextButton);

  const tableContainer = document.getElementById("table-container");
  tableContainer.appendChild(paginationContainer);
};

// Change page function
const changePage = (page) => {
  currentPage = page;
  createForecastTable(currentPage, filteredForecastList);
};

// Apply filters and sorting based on dropdown selection
const applyFilter = () => {
  const forecastData = JSON.parse(localStorage.getItem("fiveDayForecast"));
  if (!forecastData) return;

  let forecastList = [...originalForecastList]; // Work on a copy of the original list
  const filterOption = document.getElementById("filter-options").value;

  if (filterOption === "ascending") {
    forecastList.sort((a, b) => a.main.temp - b.main.temp);
  } else if (filterOption === "descending") {
    forecastList.sort((a, b) => b.main.temp - a.main.temp);
  } else if (filterOption === "rain") {
    forecastList = forecastList.filter((forecast) =>
      forecast.weather[0].main.toLowerCase().includes("rain")
    );
  } else if (filterOption === "highest-temp") {
    const highestTemp = forecastList.reduce(
      (max, current) => (current.main.temp > max.main.temp ? current : max),
      forecastList[0]
    );
    forecastList = [highestTemp]; // Show only the highest temperature day
  }

  // Store the filtered list and reset to page 1
  filteredForecastList = forecastList;
  currentPage = 1; // Reset page to 1 when applying filter
  createForecastTable(currentPage, filteredForecastList);
};

// Initialize the app when the page loads
window.onload = () => {
  displayCityName();
  const forecastData = JSON.parse(localStorage.getItem("fiveDayForecast"));
  if (forecastData) {
    originalForecastList = forecastData.list;
    filteredForecastList = [...originalForecastList]; // Initialize filtered list
    createForecastTable(currentPage, filteredForecastList); // Show the forecast table initially
  }
};
