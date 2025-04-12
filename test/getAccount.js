const axios = require("axios");
async function getAccount(account_id, price) {
  try {
    const response = await axios.get(
      `https://tonapi.io/v2/accounts/${account_id}/jettons?currencies=usd`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    const data = response.data.balances;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return error;
  }
}

module.exports = getAccount;
