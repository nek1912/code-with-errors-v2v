const axios = require('axios');

async function checkSafePlaces() {
  try {
    const response = await axios.get('http://localhost:3000/api/guardian/safe-places?lat=22.307&lng=73.181&radius=5000');
    console.log(`✅ Found ${response.data.length} places.`);
    if (response.data.length === 0) {
      console.log('Data returned:', response.data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}
checkSafePlaces();
