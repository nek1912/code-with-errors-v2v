const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateRouteSummary(activeAlerts) {
  if (!activeAlerts || activeAlerts.length === 0) {
    return 'Your route is clear and safe.';
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Skipping AI summary.');
      return 'Please be cautious, there are active alerts on your route.';
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a safety AI. Summarize these active route alerts into one concise, empathetic sentence for a woman walking home: 
${JSON.stringify(activeAlerts, null, 2)}
If there are no alerts, say 'Your route is clear and safe.'`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('GeminiSummaryService error:', error.message);
    return 'Please be cautious, there are active alerts on your route.';
  }
}

module.exports = { generateRouteSummary };
