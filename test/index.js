require("dotenv").config();
const fetchData = require("./getTransactions");
const getAccount = require("./getAccount");

const vipAccounts = {};

async function findVipAccounts() {
  const transactions = await fetchData();
  transactions.reverse();

  for (const key of transactions) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const address = key.attributes.tx_from_address;
    const account = await getAccount(
      key.attributes.tx_from_address,
      key.attributes.price_from_in_usd
    );

    if (account) {
      account.map((key) => {
        if (
          (key.jetton.name === "TON FISH MEMECOIN" && key.balance > 80000000) ||
          (key.jetton.name === "Tether USD" && key.balance > 100) ||
          (key.jetton.name === "Not Notcoin" && key.balance > 100) ||
          (key.jetton.name === "BabyRedo" && key.balance > 100)
        ) {
          console.log(key.balance);
          console.log(key.jetton.name);
          console.log(address);
          return;
        }
      });
    }
  }

  return;
}

findVipAccounts();
