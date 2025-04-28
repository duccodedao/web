const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot7820546985:AAFUYaEW73ZXHO5vCvIUow440mXSzMDCXDs';

const PROJECT_DESCRIPTION = `*NebX* is a Web3 project that allows users to monetize and earn rewards based on the value of their X (Twitter) accounts. By connecting a Web3 wallet and linking their X account, users can receive *XCOIN* airdrops and participate in the *NebX-Land* ecosystem, which includes NFTs, GameFi, and DeFi features. The project aims to turn social influence into real value through blockchain technology.`;

async function sendMessage(chatId, text, keyboard = []) {
  return axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
}

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

    const message = `Hello *${fullName}*!\n\n${PROJECT_DESCRIPTION}`;
    const buttons = [
      [
        { text: "🚀 Start NebX", url: "https://t.me/nebx_insight_bot/start" }
      ]
    ];

    await sendMessage(chatId, message, buttons);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NebX Bot is running on port ${PORT}`));
