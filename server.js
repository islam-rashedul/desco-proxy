const express = require('express');
const axios = require('axios');
const app = express();

app.get('/getBalance', async (req, res) => {
  try {
    const accountNo = req.query.accountNo;
    if (!accountNo) {
      return res.status(400).json({ error: 'Missing accountNo parameter' });
    }

    const url = `https://prepaid.desco.org.bd/api/tkdes/customer/getBalance?accountNo=${accountNo}`;
    const response = await axios.get(url, { timeout: 10000 });

    res.json(response.data); // forward DESCO response to Salesforce
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
