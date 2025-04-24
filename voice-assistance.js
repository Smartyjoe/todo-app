// voice-assistant.js

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;

let isListeningCommand = false;

function startVoiceAssistant() {
  recognition.start();
}

recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(result => result[0].transcript)
    .join('')
    .trim()
    .toLowerCase();

  console.log("Transcript:", transcript);

  if (!isListeningCommand && transcript.includes("hey todo")) {
    isListeningCommand = true;
    speak("I'm listening. What task do you want to add?");
  } else if (isListeningCommand) {
    isListeningCommand = false;
    processVoiceCommand(transcript);
  }
};

recognition.onend = () => {
  recognition.start(); // Keep listening
};

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

async function processVoiceCommand(transcript) {
  try {
    const res = await fetch('/api/process-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });

    const data = await res.json();
    fillFormWithTask(data);
  } catch (err) {
    console.error("Voice processing failed:", err);
  }
}

function fillFormWithTask(task) {
  if (task.title) document.getElementById("title").value = task.title;
  if (task.description) document.getElementById("description").value = task.description;
  if (task.dueDate) document.getElementById("dueDate").value = task.dueDate;
  if (task.dueTime) document.getElementById("dueTime").value = task.dueTime;
  if (task.priority) document.getElementById("priority").value = task.priority;

  // Optionally auto-submit the form
  addTodo(); // Assumes addTodo() is globally defined
}

// Start the assistant once page is ready
window.addEventListener("DOMContentLoaded", startVoiceAssistant);
