const axios = require('axios');

(async () => {
  try {
    const eventRes = await axios.post('http://localhost:5000/api/etkinlikler', {
      baslik: 'Test Event',
      ucret: '150',
      kontenjan: '50',
      sanatci_id: 1, // Providing a mock sanatci_id
      tarih_saat_listesi: ['2026-05-20T20:00']
    });
    console.log(eventRes.data);
  } catch (err) {
    if (err.response) console.log("ERROR DATA:", err.response.data);
    else console.log("ERROR:", err.message);
  }
})();
