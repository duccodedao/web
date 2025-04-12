const dotenv = require("dotenv");
const { Telegraf } = require("telegraf");
const axios = require("axios");

dotenv.config();

const defaultDescription = process.env.DESCRIPTION.replace(/\\n/g, "\n");

const channelId = process.env.CHANNEL_ID;

const USDTAddress = "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA";
const PTONAddress = "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez";
const AEAddress = "EQCHwHSBnJYmyefutCuvKJMjFh9dCoCF4SDHVr2wEDmOwJzp";

const bot = new Telegraf(process.env.BOT_TOKEN);

async function main() {
  setInterval(async () => {
    updateDescription();
  }, 120000);
  updateDescription();
}
main();

async function updateDescription() {
  try {
    const { data: tonAe } = await axios.post(
      `https://api.ston.fi/v1/swap/simulate`,
      {},
      {
        params: {
          offer_address: AEAddress,
          ask_address: PTONAddress,
          units: 1000000000,
          slippage_tolerance: 0.1,
        },
      }
    );
    const { data: tonUsdt } = await axios.post(
      `https://api.ston.fi/v1/swap/simulate`,
      {},
      {
        params: {
          offer_address: USDTAddress,
          ask_address: PTONAddress,
          units: 1000000000,
          slippage_tolerance: 0.1,
        },
      }
    );

    const aeTonPrice = tonAe.swap_rate;
    const usdTonPrice = tonUsdt.swap_rate;

    const aeUsdPrice = (1 / parseFloat(usdTonPrice)) * parseFloat(aeTonPrice);

    const newDescription = `AE Jetton ≈ ${formatNumber(
      aeTonPrice
    )}💎 (${formatNumber(aeUsdPrice, 2)}$)
\n${defaultDescription}`;
    await bot.telegram.setChatDescription(channelId, newDescription);
    console.log("updated description", new Date());
  } catch (e) {
    if (e?.message?.includes("Bad Request: chat description is not modified")) {
      return;
    }

    console.error(e);
  }
}

function formatNumber(n, digits = 2) {
  const num = parseFloat(n);
  const digitsCount = Math.abs(Math.floor(Math.log10(n))); // 0.02 -> -2

  return num.toFixed(digitsCount + digits);
}
