const GEMINI_API_KEY = "AIzaSyD1s-4BHK912pfsgXEIiIRn7rAD8J1yX2k";

// Store conversation history (both user and model messages)
let conversationHistory = [
  {
    role: "user", // System role to set context for the bot
    parts: [
      {
        text: "You are a helpful chatbot that answers questions about the weather. Please assist the user with any weather-related queries.",
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
