const express = require('express');
const axios = require('axios');
const app = express();

const TELEGRAM_API = `https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs`;
const LOGO_IMG = 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png';

app.use(express.json());

app.post('/webhook', async (req, res) => {
  const body = req.body;

  // Khi nhận tin nhắn văn bản
  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

    const caption = `Chào mừng *${fullName}* đến với Mini App của BmassHD`;

    await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: chatId,
      photo: LOGO_IMG,
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🧩 Apps", url: `https://t.me/bmassk3_bot/?startapp=` },
            { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
          ],
          [
            { text: "⚙️ Tiện ích", callback_data: "utilities" }
          ]
        ]
      }
    });
  }

  // Khi người dùng tương tác với nút
  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const callbackData = query.data;
    const messageId = query.message.message_id;

    // Xoá tin nhắn trước
    await axios.post(`${TELEGRAM_API}/deleteMessage`, {
      chat_id: chatId,
      message_id: messageId
    });

    // Gửi ảnh với các nội dung khác nhau tùy nút
    if (callbackData === 'utilities') {
      await sendPhotoWithButtons(chatId, "*Chọn tiện ích bên dưới*", [
        [
          { text: "⚡ Mua VIP", callback_data: "buy_vip" },
          { text: "📩 Lấy UID", callback_data: "get_uid" }
        ],
        [
          { text: "🎁 Referral", callback_data: "referral" }
        ],
        [
          { text: "🔙 Quay lại", callback_data: "back_to_menu" }
        ]
      ]);
    }

    if (callbackData === 'buy_vip') {
      await sendPhotoWithButtons(chatId,
        `Hiện tại tính năng *Mua VIP* đang phát triển.\nVui lòng liên hệ @BmassK3 để được hỗ trợ.`,
        [[{ text: "🔙 Quay lại", callback_data: "utilities" }]]
      );
    }

    if (callbackData === 'get_uid') {
      await sendPhotoWithButtons(chatId,
        `UID của bạn là:\n\`${chatId}\`\n\n*Ấn để sao chép UID!*`,
        [[{ text: "🔙 Quay lại", callback_data: "utilities" }]]
      );
    }

    if (callbackData === 'referral') {
      const referralLink = `https://t.me/bmassk3_bot/?startapp=${chatId}`;
      const shareLink = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Tham gia Mini App và nhận phần thưởng cùng tôi!")}`;

      await sendPhotoWithButtons(chatId,
        `🎁 Đây là link giới thiệu Mini App của bạn:\n\n\`${referralLink}\`\n\nBạn có thể sao chép hoặc nhấn nút bên dưới để chia sẻ.`,
        [
          [{ text: "🔗 Chia sẻ ngay", url: shareLink }],
          [{ text: "🔙 Quay lại", callback_data: "utilities" }]
        ]
      );
    }

    if (callbackData === 'back_to_menu') {
      await sendPhotoWithButtons(chatId,
        "*Bạn đã quay lại menu chính.*",
        [
          [
            { text: "🧩 Apps", url: `https://t.me/bmassk3_bot/?startapp=` },
            { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
          ],
          [
            { text: "⚙️ Tiện ích", callback_data: "utilities" }
          ]
        ]
      );
    }
  }

  res.sendStatus(200);
});

// Hàm gửi ảnh kèm nút và caption
async function sendPhotoWithButtons(chatId, caption, buttons) {
  await axios.post(`${TELEGRAM_API}/sendPhoto`, {
    chat_id: chatId,
    photo: LOGO_IMG,
    caption: caption,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: buttons
    }
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);
});
