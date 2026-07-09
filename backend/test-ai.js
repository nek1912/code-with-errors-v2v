const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/ai/chat', {
      user_message: "Can I walk home right now?",
      context: {
        time: 23,
        battery: 15,
        location_type: "isolated"
      },
      chat_history: []
    });
    console.log('✅ Response from AI Endpoint:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error('❌ Error:');
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
