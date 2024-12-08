const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TARGET_API_URL = process.env.TARGET_API_URL;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Proxy endpoint
app.all('/proxy', async (req, res) => {
  const { url, headers, body } = req;
  const targetUrl = req.query.target;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Target URL is required in the query string' });
  }

  try {
    // Forward the request to the target URL
    const apiResponse = await axios({
      method: req.method,
      url: `${TARGET_API_URL}${targetUrl}`,
      headers: { ...headers, host: undefined }, // Remove host header
      data: body,
    });

    // Send the response back to the client
    res.status(apiResponse.status).json(apiResponse.data);
  } catch (error) {
    // Handle errors from the target API
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Something went wrong', details: error.message });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
