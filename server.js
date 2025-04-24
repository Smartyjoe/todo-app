require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAIApi, Configuration } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve your frontend

// OpenAI Config
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Voice Processing Route
app.post('/api/process-voice', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript missing' });
  }

  try {
    const prompt = `
Extract task details from this input: "${transcript}"

Return a JSON like:
{
  "title": "Call the doctor",
  "description": "Appointment follow-up",
  "priority": "high", 
  "dueDate": "2025-04-30", 
  "dueTime": "10:00"
}

Only return valid JSON. If info like date/time/priority is not present, return null for them.
`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts task data from user input.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const rawText = completion.data.choices[0].message.content.trim();

    // Try parsing the response
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    const jsonStr = rawText.slice(jsonStart, jsonEnd + 1);

    const task = JSON.parse(jsonStr);
    res.json(task);
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'Failed to process transcript' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
