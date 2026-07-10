const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const router = express.Router();

// Initialize Groq using OpenAI SDK
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
});

function buildSystemPrompt(context) {
  return `You are "Aura", a vigilant AI safety companion for women.

CONTEXT:
- Time: ${context?.time || 'unknown'}:00
- Battery: ${context?.battery || 'unknown'}%
- Location: ${context?.location_type || 'unknown'}

RULES:
1. If battery < 20% OR time > 22:00 → HIGH ALERT
2. Be concise and actionable
3. ALWAYS respond with valid JSON ONLY
4. You MUST respond with valid JSON ONLY. Do not include any markdown formatting, conversational filler, or text outside the JSON object.

JSON FORMAT:
{
  "message": "Your advice here",
  "risk_level": "low" | "medium" | "high",
  "ui_actions": ["share_location", "start_fake_call", "none"]
}`;
}

router.post('/chat', async (req, res) => {
  console.log('🔥 GROQ REQUEST RECEIVED:', req.body.user_message);
  
  try {
    const { user_message, context, chat_history } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is missing' });
    }

    const systemPrompt = buildSystemPrompt(context);

    // Format chat history for OpenAI/Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chat_history || []).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: user_message }
    ];

    console.log('🔄 Calling Groq API...');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Hardcoded to bypass nodemon env caching
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" } 
    });

    const aiText = completion.choices[0].message.content;
    console.log('✅ Groq Response:', aiText);

    // Parse JSON (Groq/Llama might occasionally wrap it in markdown)
    let parsedResponse;
    try {
      const cleanText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      parsedResponse = {
        message: "I understand. Please stay safe!",
        risk_level: "medium",
        ui_actions: ["share_location"]
      };
    }

    res.json(parsedResponse);

  } catch (error) {
    console.error('💥 Groq API Error:', error);
    res.status(500).json({
      error: 'AI service unavailable',
      message: error.message
    });
  }
});

module.exports = router;
