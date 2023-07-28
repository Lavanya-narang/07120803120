const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 8008;

app.use(express.json());
app.use(cors());

async function fetchNumbers(url) {
  try {
    const response = await axios.get(url, { timeout: 500 });
    if (response.status === 200 && response.data && response.data.Numbers) {
      return response.data.Numbers;
    }
  } catch (error) {
    console.error(`Error fetching numbers from ${url}: ${error.message}`);
  }
  return [];
}

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const urlList = Array.isArray(urls) ? urls : [urls];

  try {
    const mergedNumbers = new Set();
    const promises = urlList.map((url) => fetchNumbers(url));
    const results = await Promise.all(promises);
    results.forEach((numbers) => {
      numbers.forEach((number) => mergedNumbers.add(number));
    });

    const sortedNumbers = [...mergedNumbers].sort((a, b) => a - b);
    res.json({ numbers: sortedNumbers });
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
