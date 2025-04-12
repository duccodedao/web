require("dotenv").config();

const axios = require("axios");
const API_URL = process.env.API_URL;
async function fetchData() {
  try {
    const response = await axios.get(
      "https://api.geckoterminal.com/api/v2/networks/ton/pools/EQCVflRjTn91FKGZzy2UTHgLn3hG3TsOlQIsAOPcB57K5gT5/trades",
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    const data = response.data.data;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

module.exports = fetchData;
