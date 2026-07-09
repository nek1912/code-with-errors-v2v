const axios = require('axios');

async function testOverpass() {
  const lat = 22.307;
  const lng = 73.181;
  const radius = 5000;
  
  const query = `
    [out:json];
    (
      node["amenity"="police"](around:${radius},${lat},${lng});
      node["amenity"="hospital"](around:${radius},${lat},${lng});
    );
    out center;
  `;
  
  try {
    const response = await axios.get('https://overpass-api.de/api/interpreter', {
      params: { data: query },
      headers: {
        'User-Agent': 'SafeSphereApp/1.0',
        'Accept': '*/*'
      }
    });
    console.log(`Found ${response.data.elements.length} elements.`);
    if (response.data.elements.length > 0) {
      console.log(response.data.elements[0]);
    } else {
      console.log('No elements found.');
    }
  } catch (error) {
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
  }
}
testOverpass();
