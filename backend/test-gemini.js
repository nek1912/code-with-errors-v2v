require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔑 Testing Gemini API Key...');
console.log('Key exists:', !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// We use gemini-flash-latest to match what we discovered works in this environment
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function test() {
  try {
    console.log('📤 Sending test request...');
    const result = await model.generateContent("Say hello in JSON only: {\"test\": true}");
    const response = await result.response;
    console.log('✅ SUCCESS! Response:', response.text());
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }
}

test();
