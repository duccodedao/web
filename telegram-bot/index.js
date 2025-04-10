const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = `https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs`;
const CHANNEL_ID = "@bmassk3_channel";
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

let userData = {};

function getToday7AM() {
  const now = new Date();
  now.setHours(7, 0, 0, 0);
  return now.getTime();
}

async function isMember(uid) {
  try {
    const res = await axios.get(`${TELEGRAM_API}/getChatMember`, {
      params: {
        chat_id: CHANNEL_ID,
        user_id: uid
      }
    });
    const status = res.data.result.status;
    return ['member', 'administrator', 'creator'].includes(status);
  } catch (err) {
    return false;
  }
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

  if (body.message) {
    const chatId = body.message.chat.id;
    const uid = body.message.from.id.toString();
    const fullName = `${body.message.from.first_name || ''} ${body.message.from.last_name || ''}`.trim();
    const text = body.message.text;

    if (!userData[uid]) {
      userData[uid] = {
        bmp: 0,
        bmc: 0,
        lastCheckin: 0,
        address: null,
        pendingWithdraw: null,
        joinedChannel: false
      };
    }

    if (text && userData[uid].bmc >= 1000 && !userData[uid].pendingWithdraw) {
      userData[uid].pendingWithdraw = { address: text };
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Bạn có xác nhận rút *${userData[uid].bmc} BMC* qua địa chỉ:\n\n*${text}* không?`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Xác nhận", callback_data: "confirm_withdraw" },
              { text: "❌ Hủy", callback_data: "cancel_withdraw" }
            ]
          ]
        }
      });
    } else {
      await sendMenu(chatId, fullName);
    }
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const uid = query.from.id.toString();
    const data = query.data;

    if (!userData[uid]) {
      userData[uid] = {
        bmp: 0,
        bmc: 0,
        lastCheckin: 0,
        address: null,
        pendingWithdraw: null,
        joinedChannel: false
      };
    }

    if (data === "back") {
      return await sendMenu(chatId, `${query.from.first_name || ''} ${query.from.last_name || ''}`);
    }

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
            [{ text: "📢 Tham gia Telegram +1000 BMC", callback_data: "join_channel" }],
            [{ text: "◀️ Quay lại", callback_data: "back" }]
          ]
        }
      });
    }

    if (data === "join_channel") {
      if (userData[uid].joinedChannel) {
        return await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: "Bạn đã hoàn thành nhiệm vụ này và nhận 1000 BMC trước đó rồi!"
        });
      }
      return await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Hãy tham gia kênh: ${CHANNEL_ID}, sau đó ấn nút dưới để xác nhận.`,
        reply_markup: {
          inline_keyboard: [
            [{ text: "➡️ Vào kênh", url: `https://t.me/bmassk3_channel` }],
            [{ text: "✅ Tôi đã tham gia", callback_data: "check_joined" }]
          ]
        }
      });
    }

    if (data === "check_joined") {
      if (userData[uid].joinedChannel) {
        return await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: "Bạn đã nhận 1000 BMC trước đó rồi."
        });
      }

      const joined = await isMember(uid);
      if (joined) {
        userData[uid].bmc += 1000;
        userData[uid].joinedChannel = true;
        return await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: "✅ Bạn đã tham gia kênh thành công!\n+1000 BMC vào tài khoản."
        });
      } else {
        return await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: "❌ Bạn chưa tham gia kênh. Hãy tham gia trước khi xác nhận!"
        });
      }
    }

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

    if (data === "withdraw") {
      if (userData[uid].bmc < 1000) {
        return await axios.post(`${TELEGRAM_API}/sendPhoto`, {
          chat_id: chatId,
          photo: IMAGE_URL,
          caption: `Bạn cần ít nhất *1000 BMC* để rút.\nHãy thử *Swap BMP → BMC* nếu đủ.`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "◀️ Quay lại", callback_data: "utils" }]]
          }
        });
      }

      return await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Vui lòng nhập địa chỉ ví TON của bạn để rút BMC.`
      });
    }

    if (data === "confirm_withdraw") {
      const { pendingWithdraw, bmc } = userData[uid];
      if (!pendingWithdraw) return;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: CHANNEL_ID,
        text: `🔔 Rút BMC mới:\nUID: ${uid}\nAddress: ${pendingWithdraw.address}\nSố lượng: ${bmc} BMC`
      });

      userData[uid].bmc = 0;
      userData[uid].pendingWithdraw = null;

      return await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `✅ Rút thành công ${bmc} BMC.\nBạn sẽ nhận được coin trong thời gian sớm nhất!`
      });
    }

    if (data === "cancel_withdraw") {
      userData[uid].pendingWithdraw = null;
      return await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `❌ Hủy yêu cầu rút thành công.`
      });
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot running on port ${PORT}`);
});
