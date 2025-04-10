const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = `https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs`;
const CHANNEL_ID = "@bmassk3_channel";
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

let userData = {}; // Lưu dữ liệu UID, BMP, BMC, lastCheckin, address

function getToday7AM() {
  const now = new Date();
  now.setHours(7, 0, 0, 0);
  return now.getTime();
}

async function sendMenu(chatId, fullName) {
  const caption = `Xin chào *${fullName}*.\nChào mừng đến với Mini App của BmassHD.`;
  await axios.post(`${TELEGRAM_API}/sendPhoto`, {
    chat_id: chatId,
    photo: IMAGE_URL,
    caption,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" },
          { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
        ],
        [{ text: "⚙️ Tiện ích", callback_data: "utils" }]
      ]
    }
  });
}

app.post('/webhook', async (req, res) => {
  const body = req.body;

  // Khi nhận tin nhắn
  if (body.message) {
    const chatId = body.message.chat.id;
    const fullName = `${body.message.from.first_name || ''} ${body.message.from.last_name || ''}`.trim();
    await sendMenu(chatId, fullName);
  }

  // Khi bấm nút
  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const uid = query.from.id.toString();

    // Khởi tạo nếu chưa có dữ liệu người dùng
    if (!userData[uid]) {
      userData[uid] = {
        bmp: 0,
        bmc: 0,
        lastCheckin: 0,
        address: null
      };
    }

    const data = query.data;

    // Quay lại menu chính
    if (data === "back") {
      return await sendMenu(chatId, `${query.from.first_name || ''} ${query.from.last_name || ''}`);
    }

    // Hiện tiện ích
    if (data === "utils") {
      return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: `Chọn tiện ích bạn muốn sử dụng`,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⚡ Mua VIP", callback_data: "buy_vip" },
              { text: "🔑 Lấy UID", callback_data: "get_uid" }
            ],
            [
              { text: "✅ Check-in", callback_data: "checkin" },
              { text: "💰 Số dư", callback_data: "balance" }
            ],
            [
              { text: "🔁 Swap BMP → BMC", callback_data: "swap" },
              { text: "📤 Rút BMC", callback_data: "withdraw" }
            ],
            [{ text: "📢 Referral", callback_data: "ref" }],
            [{ text: "◀️ Quay lại", callback_data: "back" }]
          ]
        }
      });
    }

    // Lấy UID
    if (data === "get_uid") {
      return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: `UID của bạn là: \`${uid}\`\nẤn để sao chép`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
        }
      });
    }

    // Check-in
    if (data === "checkin") {
      const last = userData[uid].lastCheckin;
      const now = Date.now();
      const resetTime = getToday7AM();

      if (last >= resetTime) {
        return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
          chat_id: chatId,
          photo: IMAGE_URL,
          caption: "Bạn đã check-in hôm nay rồi. Hãy quay lại sau 7h sáng mai!",
          reply_markup: {
            inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
          }
        });
      }

      userData[uid].bmp += 100;
      userData[uid].lastCheckin = now;

      return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: "✅ Check-in thành công!\n+100 BMP đã được cộng vào tài khoản.",
        reply_markup: {
          inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
        }
      });
    }

    // Xem số dư
    if (data === "balance") {
      const bmp = userData[uid].bmp;
      const bmc = userData[uid].bmc;
      return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: `Số dư hiện tại:\n• BMP: *${bmp}*\n• BMC: *${bmc}*`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
        }
      });
    }

    // Swap
    if (data === "swap") {
      const bmp = userData[uid].bmp;
      if (bmp < 10) {
        return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
          chat_id: chatId,
          photo: IMAGE_URL,
          caption: `Bạn cần ít nhất 10 BMP để swap.`,
          reply_markup: {
            inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
          }
        });
      }
      const bmc = Math.floor(bmp / 10);
      userData[uid].bmp = 0;
      userData[uid].bmc += bmc;

      return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: `Đã swap thành công!\nBạn nhận được *${bmc} BMC* từ *${bmc * 10} BMP*`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
        }
      });
    }

    // Mua VIP
    if (data === "buy_vip") {
      return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: `Tính năng đang phát triển. Vui lòng liên hệ @BmassK3 để mua VIP.`,
        reply_markup: {
          inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
        }
      });
    }

    // Referral
    if (data === "ref") {
      return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: `Link giới thiệu của bạn:\nhttps://t.me/bmassk3_bot/?startapp=${uid}`,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Share", url: `https://t.me/share/url?url=https://t.me/bmassk3_bot/?startapp=${uid}` }],
            [{ text: "◀️ Quay lại", callback_data: "utils" }]
          ]
        }
      });
    }

    // Rút BMC
    if (data === "withdraw") {
      if (userData[uid].bmc < 1000) {
        return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
          chat_id: chatId,
          photo: IMAGE_URL,
          caption: `Bạn cần ít nhất *1000 BMC* để rút.\nHãy thử *Swap BMP → BMC* nếu đủ.`,
          parse_mode: "Markdown",
          reply_markup: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
        });
      }

      return await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Vui lòng nhập địa chỉ ví TON của bạn để rút BMC.`,
      });
    }

    // (Bạn có thể bổ sung tiếp phần xác nhận, nhập địa chỉ, gửi về channel nếu muốn)

  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot running on port ${PORT}`);
});
