const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const https = require('https');

const app = express();
app.use(helmet());
app.use(express.json()); // parse JSON body for POST requests

// Load environment variables from Render
const DESCO_BASE = process.env.DESCO_BASE;
const API_KEY = process.env.API_KEY;

if (!DESCO_BASE || !API_KEY) {
    console.error('⚠️ DESCO_BASE or API_KEY environment variable is missing!');
    process.exit(1);
}

const REQUEST_TIMEOUT_MS = 10000;

// ⚠️ Disable SSL verification (use only if safe)
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

// Middleware: check API key
function requireApiKey(req, res, next) {
    const key = req.query.key || req.query.API_KEY || req.header('x-api-key');
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
        const response = await axios.get(url, {
            timeout: REQUEST_TIMEOUT_MS,
            httpsAgent
        });

        res.status(response.status).json(response.data);
    } catch (err) {
        console.error('GET /getBalance error:', err.message || err);
        const message = err.response && err.response.data ? err.response.data : err.message;
        res.status(500).json({ error: 'Proxy error', details: message });
    }
});

// POST /getBalance with JSON body { "accountNo": "41073896" }
app.post('/getBalance', requireApiKey, async (req, res) => {
    try {
        const accountNo = req.body && req.body.accountNo;
        if (!accountNo) return res.status(400).json({ error: 'Missing accountNo in JSON body' });

        const url = `${DESCO_BASE}/customer/getBalance?accountNo=${encodeURIComponent(accountNo)}`;
        const response = await axios.get(url, {
            timeout: REQUEST_TIMEOUT_MS,
            httpsAgent
        });

        res.status(response.status).json(response.data);
    } catch (err) {
        console.error('POST /getBalance error:', err.message || err);
        const message = err.response && err.response.data ? err.response.data : err.message;
        res.status(500).json({ error: 'Proxy error', details: message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Keep-alive endpoint to keep Render free-tier awake
app.get('/keepAlive', requireApiKey, (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
