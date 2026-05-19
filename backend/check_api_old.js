const axios = require('axios');

(async () => {
  try {
    const eventRes = await axios.post('http://localhost:5000/api/etkinlikler', {
      baslik: 'Test Event Old Payload',
      ucret: '150',
      kontenjan: '50',
      tarih_saat: '2026-05-20T20:00', // OLD PAYLOAD KEY!
      sanatci_id: 1, 
    });
    console.log("OLD PAYLOAD SUCCESS:", eventRes.data);
  } catch (err) {
    if (err.response) console.log("OLD PAYLOAD ERROR:", err.response.data);
    else console.log("OLD PAYLOAD ERROR:", err.message);
  }
})();
