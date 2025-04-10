const express = require('express');
const axios = require('axios');
const app = express();

const TELEGRAM_API = `https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs`;  // Thay bằng token thật của bạn
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const body = req.body;

  // Khi có tin nhắn văn bản
  if (body.message) {
    const message = body.message;
    const chatId = message.chat.id;
    const fullName = `${message.from.first_name || ''} ${message.from.last_name || ''}`.trim();

    const caption = `Chào mừng *${fullName}* đến với Mini App của BmassHD`;

    await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: chatId,
      photo: 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png',
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🧩 Apps", url: `https://t.me/bmassk3_bot/?startapp=${chatId}` },
            { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
          ],
          [
            { text: "⚡ Mua VIP", callback_data: "buy_vip" }
          ]
        ]
      }
    });
  }

  // Khi người dùng bấm nút "Mua VIP"
  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: `Đang mở giao diện thanh toán...`,
    });

    // Gửi lệnh /buy để bot.py xử lý
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: `/buy`
    });
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);
});
