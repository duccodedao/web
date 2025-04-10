const express = require('express');
const axios = require('axios');
const app = express();

const TELEGRAM_API = `https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs`;
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
            { text: "⚡ Mua VIP", callback_data: "buy_vip" },
            { text: "📩 Lấy UID", callback_data: "get_uid" }
          ]
        ]
      }
    });
  }

  // Xử lý các callback từ inline button
  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const callbackData = query.data;

    if (callbackData === 'buy_vip') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `⚠️ Tính năng *Mua VIP* hiện đang phát triển.\n\nVui lòng liên hệ @BmassK3 để được hỗ trợ.`,
        parse_mode: "Markdown"
      });
    }

    if (callbackData === 'get_uid') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `🆔 UID của bạn là: \`${chatId}\`\n\nẤn vào để sao chép và sử dụng.`,
        parse_mode: "Markdown"
      });
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);
});
