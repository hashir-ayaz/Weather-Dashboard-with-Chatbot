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

const displayCityName = () => {
  const savedCityName = localStorage.getItem("cityName");

  // If the cityName exists in localStorage, display it in the heading
  if (savedCityName) {
    document.getElementById(
      "city-heading"
    ).innerText = `Weather Information for ${savedCityName}`;
  } else {
    document.getElementById("city-heading").innerText = `No city selected`;
  }
};

const createForecastTable = (page = 1) => {
  // Get the forecast data from localStorage
  const forecastData = JSON.parse(localStorage.getItem("fiveDayForecast"));
  if (!forecastData) return; // If no forecast data, don't create the table

  // Get the list of forecast entries
  const forecastList = forecastData.list;

  // Calculate the start and end index for the current page
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Create a table element
  const table = document.createElement("table");
  table.classList.add("forecast-table"); // Add a class for styling

  // Create the header row
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

  // Loop through the forecastList for the current page
  forecastList.slice(startIndex, endIndex).forEach((forecast) => {
    const row = document.createElement("tr");

    // Extract relevant information
    const dateTime = forecast.dt_txt;
    const temperature = Math.round(forecast.main.temp - 273.15); // Convert Kelvin to Celsius
    const condition = forecast.weather[0].description;
    const windSpeed = forecast.wind.speed;
    const humidity = forecast.main.humidity;

    // Create table cells
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

  // Append the table to the document
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = ""; // Clear any existing content
  tableContainer.appendChild(table);

  // Add pagination controls
  addPaginationControls(forecastList.length);
};

const addPaginationControls = (totalRows) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginationContainer = document.createElement("div");
  paginationContainer.classList.add("pagination-controls");

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

    // Only add the "active-page" class if it's the current page
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

  // Append the pagination controls to the document
  const tableContainer = document.getElementById("table-container");
  tableContainer.appendChild(paginationContainer);
};

const changePage = (page) => {
  currentPage = page;
  createForecastTable(page);
};

// Call the function to display the city name and create the forecast table when the page loads
window.onload = () => {
  displayCityName(); // Display city name
  createForecastTable(); // Create forecast table
};
