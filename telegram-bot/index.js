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
    const text = "Chào bạn! Nhấn vào nút bên dưới để tham gia kênh nhé 👇";

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔥 Tham gia kênh", url: "https://t.me/your_channel_here" }
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
