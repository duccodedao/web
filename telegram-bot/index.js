const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const CHANNEL_ID = '@bmassk3_channel';

const userData = {};

const createMainMenu = (chatId, fullName) => ({
  chat_id: chatId,
  photo: 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png',
  caption: `Xin chào *${fullName}*, chào mừng bạn đến với Mini App của BmassHD`,
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
      { text: "🔁 Swap BMP → BMC", callback_data: "swap_input" },
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
    const fullName = body.message.from.first_name + (body.message.from.last_name ? ` ${body.message.from.last_name}` : '');

    if (!userData[chatId]) {
      userData[chatId] = { bmp: 0, lastCheckIn: null, address: null };
    }

    const state = userData[chatId].state;

    if (state === 'awaiting_swap_amount') {
      const amount = parseInt(body.message.text);
      const bmp = userData[chatId].bmp;
      const requiredBMP = amount * 10;
      if (!isNaN(amount) && bmp >= requiredBMP) {
        userData[chatId].bmp -= requiredBMP;
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `Đã đổi thành công ${requiredBMP} BMP thành ${amount} BMC!`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      } else {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `Không đủ BMP để thực hiện giao dịch.`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      }
      userData[chatId].state = null;
    }

    else if (state === 'awaiting_address') {
      userData[chatId].address = body.message.text;
      userData[chatId].state = 'awaiting_confirm';
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Bạn có xác nhận rút *${Math.floor(userData[chatId].bmp / 10)} BMC* qua *${userData[chatId].address}* không?`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Xác nhận", callback_data: "confirm_withdraw" }, { text: "❌ Huỷ", callback_data: "back" }]
          ]
        }
      });
    }

    else {
      await axios.post(`${TELEGRAM_API}/sendPhoto`, createMainMenu(chatId, fullName));
    }
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
      await axios.post(`${TELEGRAM_API}/sendPhoto`, createMainMenu(chatId, query.from.first_name));
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
        reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
      });
    }

    if (data === 'ref') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Link giới thiệu của bạn:\nhttps://t.me/bmassk3_bot/?startapp=${chatId}`,
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
          text: `Bạn đã check-in hôm nay rồi.`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      } else {
        userData[chatId].lastCheckIn = today;
        userData[chatId].bmp += 100;
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `Check-in thành công! +100 BMP.`,
          reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
        });
      }
    }

    if (data === 'view_balance') {
      const bmp = userData[chatId].bmp;
      const bmc = Math.floor(bmp / 10);
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Số dư:\nBMP: ${bmp}\nBMC (tạm tính): ${bmc}`,
        reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
      });
    }

    if (data === 'swap_input') {
      userData[chatId].state = 'awaiting_swap_amount';
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Nhập số lượng BMC bạn muốn nhận (1 BMC = 10 BMP):`,
      });
    }

    if (data === 'withdraw_bmc') {
      userData[chatId].state = 'awaiting_address';
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Vui lòng nhập địa chỉ ví TON (Toncoin):`
      });
    }

    if (data === 'confirm_withdraw') {
      const bmc = Math.floor(userData[chatId].bmp / 10);
      const address = userData[chatId].address;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Yêu cầu rút ${bmc} BMC của bạn đã được gửi.`,
        reply_markup: { inline_keyboard: [[{ text: "↩️ Quay lại", callback_data: "back" }]] }
      });

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: CHANNEL_ID,
        text: `**YÊU CẦU RÚT BMC**\nUID: ${chatId}\nAddress: \`${address}\`\nSố lượng: ${bmc} BMC`,
        parse_mode: "Markdown"
      });

      userData[chatId].state = null;
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot đang chạy cổng ${PORT}`));
