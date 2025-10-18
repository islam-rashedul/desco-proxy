const express = require('express');
const axios = require('axios');
const app = express();

// load env vars from Render
const DESCO_BASE = process.env.DESCO_BASE;
const API_KEY = process.env.API_KEY;

app.get('/getBalance', async (req, res) => {
  try {
    const accountNo = req.query.accountNo;
    const key = req.query.key;

    if (!accountNo) {
      return res.status(400).json({ error: 'Missing accountNo parameter' });
    }

    // simple protection: require API_KEY
    if (!key || key !== API_KEY) {
      return res.status(403).json({ error: 'Unauthorized request' });
    }

    const url = `${DESCO_BASE}/customer/getBalance?accountNo=${accountNo}`;
    const response = await axios.get(url, { timeout: 10000 });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
