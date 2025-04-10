const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const CHANNEL_ID = '@bmassk3_channel';

const userData = {}; // Lưu BMP, checkin, address tạm thời trong RAM (render restart sẽ mất)

const createMainMenu = (chatId) => ({
  chat_id: chatId,
  photo: 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png',
  caption: 'Chào mừng *bạn* đến với Mini App của BmassHD',
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🧩 Apps", url: `https://t.me/bmassk3_bot/?startapp=` },
        { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
      ],
      [{ text: "⚙️ Tiện ích", callback_data: "show_tools" }]
    ]
  }
});

const toolsMenu = {
  inline_keyboard: [
    [
      { text: "⚡ Mua VIP", callback_data: "buy_vip" },
      { text: "🆔 Lấy UID", callback_data: "get_uid" }
    ],
    [
      { text: "🎁 Check-in", callback_data: "check_in" },
      { text: "💰 Số dư", callback_data: "view_balance" }
    ],
    [
      { text: "🔁 Swap BMP → BMC", callback_data: "swap" },
      { text: "📤 Rút BMC", callback_data: "withdraw_bmc" }
    ],
    [
      { text: "🔗 Refer", callback_data: "ref" },
      { text: "↩️ Quay lại", callback_data: "back" }
    ]
  ]
};

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.message) {
    const chatId = body.message.chat.id;
    await axios.post(`${TELEGRAM_API}/sendPhoto`, createMainMenu(chatId));
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const data = query.data;

    if (!userData[chatId]) {
      userData[chatId] = { bmp: 0, lastCheckIn: null, address: null };
    }

    if (data === 'show_tools') {
      await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png',
        caption: '*Tiện ích bạn cần là gì?*',
        parse_mode: "Markdown",
        reply_markup: toolsMenu
      });
    }

    if (data === 'back') {
      await axios.post(`${TELEGRAM_API}/sendPhoto`, createMainMenu(chatId));
    }

    if (data === 'buy_vip') {
      await axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo: 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png',
        caption: 'Tính năng đang phát triển, vui lòng liên hệ @BmassK3 để được hỗ trợ!',
        parse_mode: "Markdown",
        reply_markup: toolsMenu
      });
    }

    if (data === 'get_uid') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `UID của bạn là: \`${chatId}\``,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]]
        }
      });
    }

    if (data === 'ref') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Link giới thiệu của bạn là:\nhttps://t.me/bmassk3_bot/?startapp=${chatId}`,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Share", url: `https://t.me/share/url?url=https://t.me/bmassk3_bot/?startapp=${chatId}` }],
            [{ text: "↩️ Quay lại", callback_data: "back" }]
          ]
        }
      });
    }

    if (data === 'check_in') {
      const today = new Date().toDateString();
      if (userData[chatId].lastCheckIn === today) {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `Bạn đã check-in hôm nay rồi. Hãy quay lại sau 7h sáng mai.`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      } else {
        userData[chatId].lastCheckIn = today;
        userData[chatId].bmp += 100;
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `Bạn đã nhận được +100 BMP thành công!`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      }
    }

    if (data === 'view_balance') {
      const bmp = userData[chatId].bmp;
      const bmc = Math.floor(bmp / 10);
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Số dư BMP: ${bmp} BMP\nTương đương: ${bmc} BMC`,
        reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
      });
    }

    if (data === 'swap') {
      const bmp = userData[chatId].bmp;
      const bmc = Math.floor(bmp / 10);
      if (bmc > 0) {
        userData[chatId].bmp -= bmc * 10;
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `Đã chuyển thành công ${bmc} BMC!`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      } else {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `Bạn cần ít nhất 10 BMP để swap.`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      }
    }

    if (data === 'withdraw_bmc') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Vui lòng gửi địa chỉ ví TON của bạn:`,
      });
      userData[chatId].awaitingAddress = true;
    }
  }

  if (body.message && body.message.text && userData[body.message.chat.id]?.awaitingAddress) {
    const chatId = body.message.chat.id;
    const address = body.message.text;
    userData[chatId].awaitingAddress = false;
    userData[chatId].address = address;

    const bmc = Math.floor(userData[chatId].bmp / 10);

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: `Xác nhận rút:\nAddress: ${address}\nSố lượng: ${bmc} BMC`,
      reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
    });

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: CHANNEL_ID,
      text: `Yêu cầu rút BMC:\nAddress: ${address}\nSố lượng: ${bmc} BMC`
    });
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server is running on port ${PORT}`);
});
