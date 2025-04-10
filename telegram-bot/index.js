const express = require('express');
const axios = require('axios');
const app = express();

const TELEGRAM_API = `https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs`;
app.use(express.json());

const userBalances = {}; // Dùng để lưu điểm BMC trong bộ nhớ RAM (local server)

const mainMenuKeyboard = [
  [
    { text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" },
    { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
  ],
  [
    { text: "🧰 Tiện ích", callback_data: "utility_menu" }
  ]
];

const utilityKeyboard = [
  [
    { text: '⚡ Mua VIP', callback_data: 'buy_vip' },
    { text: '🆔 Lấy UID', callback_data: 'get_uid' }
  ],
  [
    { text: '🎯 Check in', callback_data: 'check_in' },
    { text: '💰 Số dư BMC', callback_data: 'get_balance' }
  ],
  [
    { text: '👥 Referral', callback_data: 'referral' }
  ],
  [
    { text: '⬅️ Quay lại', callback_data: 'back' }
  ]
];

// Gửi ảnh + caption + nút
async function sendPhotoWithText(chatId, text, buttons) {
  await axios.post(`${TELEGRAM_API}/sendPhoto`, {
    chat_id: chatId,
    photo: 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png',
    caption: text,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: buttons
    }
  });
}

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

    const welcome = `Chào mừng *${fullName}* đến với Mini App của BmassHD`;
    await sendPhotoWithText(chatId, welcome, mainMenuKeyboard);
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const data = query.data;

    switch (data) {
      case 'utility_menu':
        await sendPhotoWithText(chatId, `🧰 Chọn tiện ích bạn muốn sử dụng:`, utilityKeyboard);
        break;

      case 'buy_vip':
        await sendPhotoWithText(chatId, `⚡ Tính năng đang phát triển.\nLiên hệ @BmassK3 để được hỗ trợ!`, utilityKeyboard);
        break;

      case 'get_uid':
        await sendPhotoWithText(chatId, `🆔 UID của bạn là: \`${chatId}\`\n\nẤn để sao chép!`, utilityKeyboard);
        break;

      case 'check_in':
        if (!userBalances[chatId]) userBalances[chatId] = 0;
        userBalances[chatId] += 100;
        await sendPhotoWithText(chatId, `🎯 Check-in thành công!\n+100 BMC vào tài khoản.`, utilityKeyboard);
        break;

      case 'get_balance':
        const balance = userBalances[chatId] || 0;
        await sendPhotoWithText(chatId, `💰 Số dư hiện tại của bạn là *${balance} BMC*`, utilityKeyboard);
        break;

      case 'referral':
        const ref = `https://t.me/bmassk3_bot/?startapp=${chatId}`;
        const share = `https://t.me/share/url?url=${encodeURIComponent(ref)}&text=Tham gia MiniApp BmassHD ngay!`;

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `👥 Đây là link giới thiệu của bạn:\n${ref}\n\nChia sẻ ngay: [Bấm để chia sẻ](${share})`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "⬅️ Quay lại", callback_data: "back" }]]
          }
        });
        break;

      case 'back':
        await sendPhotoWithText(chatId, `Chọn tính năng bên dưới để tiếp tục`, mainMenuKeyboard);
        break;
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);
});
