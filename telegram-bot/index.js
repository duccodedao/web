const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const CHANNEL_ID = "@bmassk3_channel";
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

async function sendPhoto(chatId, caption, keyboard = []) {
  return axios.post(`${TELEGRAM_API}/sendPhoto`, {
    chat_id: chatId,
    photo: IMAGE_URL,
    caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });
}

async function sendMessage(chatId, text, keyboard = []) {
  return axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });
}

async function sendMenu(chatId, fullName) {
  const caption = `Xin chào *${fullName}*.\nChào mừng đến với Mini App của BmassHD.`;
  await sendPhoto(chatId, caption, [
    [
      { text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" }
    ],
    [
      { text: "📢 Channel", url: "https://t.me/bmassk3_channel" },
      { text: "⚙️ Tiện ích", callback_data: "utils" }
    ]
  ]);
}

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

    return sendMenu(chatId, fullName);
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const uid = query.from.id.toString();
    const data = query.data;

    if (data === "utils") {
      return sendPhoto(chatId, "Chọn tiện ích bạn muốn sử dụng", [
        [
          { text: "⚡ Mua VIP", callback_data: "buy_vip" },
          { text: "💸 Mua Coin", url: "https://t.me/aliniex_bot/amp?startapp=tel_8xb3PN6dKJEXBWd" }
        ],
        [
          { text: "🔑 Lấy UID", callback_data: "get_uid" }
        ],
        [
          { text: "◀️ Quay lại", callback_data: "back" }
        ]
      ]);
    }

    if (data === "back") {
      return sendMenu(chatId, `${query.from.first_name || ''} ${query.from.last_name || ''}`.trim());
    }

    if (data === "get_uid") {
      return sendMessage(chatId, `🔑 UID của bạn là: \`${uid}\``, [
        [{ text: "◀️ Quay lại", callback_data: "utils" }]
      ]);
    }

    if (data === "buy_vip") {
      return sendMessage(chatId, "⚡ Để mua VIP, vui lòng liên hệ Admin hoặc truy cập website chính thức.", [
        [{ text: "◀️ Quay lại", callback_data: "utils" }]
      ]);
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => console.log('Bot is running on port 3000'));
