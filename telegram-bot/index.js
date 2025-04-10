const express = require('express');
const axios = require('axios');
const app = express();

const TELEGRAM_API = `https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs`;
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const body = req.body;

  // Khi người dùng gửi tin nhắn
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

  // Khi người dùng bấm nút callback
  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const callbackData = query.data;
    const messageId = query.message.message_id;

    // Xoá tin nhắn cũ
    await axios.post(`${TELEGRAM_API}/deleteMessage`, {
      chat_id: chatId,
      message_id: messageId
    });

    // Tiện ích
    if (callbackData === 'utilities') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "Chọn tiện ích bên dưới:",
        reply_markup: {
          inline_keyboard: [
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
          ]
        }
      });
    }

    // Mua VIP
    if (callbackData === 'buy_vip') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Hiện tại tính năng *Mua VIP* đang phát triển.\nVui lòng liên hệ @BmassK3 để được hỗ trợ.`,
        parse_mode: "Markdown"
      });
    }

    // Lấy UID
    if (callbackData === 'get_uid') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `UID của bạn là:\n\`${chatId}\``,
        parse_mode: "Markdown"
      });
    }

    // Referral
    if (callbackData === 'referral') {
      const referralLink = `https://t.me/bmassk3_bot/?startapp=${chatId}`;
      const shareLink = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Tham gia Mini App và nhận phần thưởng cùng tôi!")}`;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `🎁 Đây là link giới thiệu Mini App của bạn:\n\n\`${referralLink}\`\n\nBạn có thể sao chép hoặc nhấn nút bên dưới để chia sẻ.`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔗 Chia sẻ ngay", url: shareLink }
            ],
            [
              { text: "🔙 Quay lại", callback_data: "utilities" }
            ]
          ]
        }
      });
    }

    // Quay lại menu chính
    if (callbackData === 'back_to_menu') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Bạn đã quay lại menu chính.`,
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
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);
});
