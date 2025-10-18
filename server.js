const express = require('express');
const axios = require('axios');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json()); // for POST JSON bodies

// Config via environment variables
const DESCO_BASE = process.env.DESCO_BASE || 'https://prepaid.desco.org.bd/api/tkdes';
const API_KEY = process.env.API_KEY || 'please-set-a-secure-key'; // must set on Render
const REQUEST_TIMEOUT_MS = 10000;

// Simple auth middleware: require x-api-key header for POST; optional for GET if you prefer
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key') || req.query.api_key;
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - missing or invalid API key' });
  }
  next();
}

// GET /getBalance?accountNo=...
app.get('/getBalance', requireApiKey, async (req, res) => {
  try {
    const accountNo = req.query.accountNo;
    if (!accountNo) return res.status(400).json({ error: 'Missing accountNo parameter' });

    const url = `${DESCO_BASE}/customer/getBalance?accountNo=${encodeURIComponent(accountNo)}`;
    const response = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });

    // Forward the DESCO response body (status and JSON)
    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error('GET /getBalance error:', err.message || err);
    const message = err.response && err.response.data ? err.response.data : err.message;
    return res.status(500).json({ error: 'Proxy error', details: message });
  }
});

// POST /getBalance  with JSON body { "accountNo": "41073896" } and header x-api-key
app.post('/getBalance', requireApiKey, async (req, res) => {
  try {
    const accountNo = req.body && req.body.accountNo;
    if (!accountNo) return res.status(400).json({ error: 'Missing accountNo in JSON body' });

    const url = `${DESCO_BASE}/customer/getBalance?accountNo=${encodeURIComponent(accountNo)}`;
    const response = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error('POST /getBalance error:', err.message || err);
    const message = err.response && err.response.data ? err.response.data : err.message;
    return res.status(500).json({ error: 'Proxy error', details: message });
  }
});

// health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
