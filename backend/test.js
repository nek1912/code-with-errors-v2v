const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: '550e8400-e29b-41d4-a716-446655440000', role: 'user' }, 'K5op4laa9Pzw7kwA7xQzkxfF0Qe7BEjr', { expiresIn: '1h' });

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/journey/start', {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      destinationName: 'Safe House',
      destinationLat: 22.3,
      destinationLng: 73.1,
      transportMode: 'foot-walking'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('ERROR:', err.response?.data || err.message);
  }
}
test();
