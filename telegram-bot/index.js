const express = require('express');
const axios = require('axios');
const app = express();

const TOKEN = '6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

app.use(express.json());

app.post(`/webhook`, async (req, res) => {
  const message = req.body.message;

  if (message) {
    const chatId = message.chat.id;
    const fullName = `${message.from.first_name || ''} ${message.from.last_name || ''}`.trim();
    const text = `*Chào mừng ${fullName} đến với Mini App của BmassHD*`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" },
            { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
          ]
        ]
      }
    });
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot is running on port", PORT);
});
