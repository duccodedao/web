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
      params: { chat_id: CHANNEL_ID, user_id: uid }
    });
    const status = res.data.result.status;
    return ['member', 'administrator', 'creator'].includes(status);
  } catch {
    return false;
  }
}

function initUser(uid) {
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
}

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
      { text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" },
      { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
    ],
    [{ text: "⚙️ Tiện ích", callback_data: "utils" }]
  ]);
}

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const uid = msg.from.id.toString();
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
    const text = msg.text;

    initUser(uid);

    if (text && userData[uid].bmc >= 1000 && !userData[uid].pendingWithdraw) {
      userData[uid].pendingWithdraw = { address: text };
      return sendMessage(chatId, `Bạn có xác nhận rút *${userData[uid].bmc} BMC* qua địa chỉ:\n\n*${text}* không?`, [
        [
          { text: "✅ Xác nhận", callback_data: "confirm_withdraw" },
          { text: "❌ Hủy", callback_data: "cancel_withdraw" }
        ]
      ]);
    } else {
      return sendMenu(chatId, fullName);
    }
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const uid = query.from.id.toString();
    const data = query.data;

    initUser(uid);

    if (data === "back") return sendMenu(chatId, `${query.from.first_name || ''} ${query.from.last_name || ''}`);

    if (data === "utils") {
      return sendPhoto(chatId, `Chọn tiện ích bạn muốn sử dụng`, [
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
      ]);
    }

    if (data === "join_channel") {
      if (userData[uid].joinedChannel) {
        return sendMessage(chatId, "Bạn đã hoàn thành nhiệm vụ này và nhận 1000 BMC trước đó rồi!");
      }
      return sendMessage(chatId, `Hãy tham gia kênh: ${CHANNEL_ID}, sau đó ấn nút dưới để xác nhận.`, [
        [{ text: "➡️ Vào kênh", url: `https://t.me/bmassk3_channel` }],
        [{ text: "✅ Tôi đã tham gia", callback_data: "check_joined" }]
      ]);
    }

    if (data === "check_joined") {
      if (userData[uid].joinedChannel) {
        return sendMessage(chatId, "Bạn đã nhận 1000 BMC trước đó rồi.");
      }
      const joined = await isMember(uid);
      if (joined) {
        userData[uid].bmc += 1000;
        userData[uid].joinedChannel = true;
        return sendMessage(chatId, "✅ Bạn đã tham gia kênh thành công!\n+1000 BMC vào tài khoản.");
      } else {
        return sendMessage(chatId, "❌ Bạn chưa tham gia kênh. Hãy tham gia trước khi xác nhận!");
      }
    }

    if (data === "get_uid") {
      return sendPhoto(chatId, `UID của bạn là: \`${uid}\`\nẤn để sao chép`, [
        [{ text: "◀️ Quay lại", callback_data: "utils" }]
      ]);
    }

    if (data === "checkin") {
      const now = Date.now();
      if (userData[uid].lastCheckin >= getToday7AM()) {
        return sendPhoto(chatId, "Bạn đã check-in hôm nay rồi. Hãy quay lại sau 7h sáng mai!", [
          [{ text: "◀️ Quay lại", callback_data: "utils" }]
        ]);
      }
      userData[uid].bmp += 100;
      userData[uid].lastCheckin = now;
      return sendPhoto(chatId, "✅ Check-in thành công!\n+100 BMP đã được cộng vào tài khoản.", [
        [{ text: "◀️ Quay lại", callback_data: "utils" }]
      ]);
    }

    if (data === "balance") {
      const { bmp, bmc } = userData[uid];
      return sendPhoto(chatId, `Số dư hiện tại:\n• BMP: *${bmp}*\n• BMC: *${bmc}*`, [
        [{ text: "◀️ Quay lại", callback_data: "utils" }]
      ]);
    }

    if (data === "swap") {
      const bmp = userData[uid].bmp;
      if (bmp < 10) {
        return sendPhoto(chatId, `Bạn cần ít nhất 10 BMP để swap.`, [
          [{ text: "◀️ Quay lại", callback_data: "utils" }]
        ]);
      }
      const bmc = Math.floor(bmp / 10);
      userData[uid].bmp = 0;
      userData[uid].bmc += bmc;
      return sendPhoto(chatId, `Đã swap thành công!\nBạn nhận được *${bmc} BMC* từ *${bmc * 10} BMP*`, [
        [{ text: "◀️ Quay lại", callback_data: "utils" }]
      ]);
    }

    if (data === "withdraw") {
      return sendMessage(chatId, "Hãy gửi địa chỉ ví TON bạn muốn rút BMC về.\n*Lưu ý*: Bạn cần ít nhất 1000 BMC để rút.");
    }

    if (data === "confirm_withdraw") {
      const info = userData[uid];
      if (info.bmc >= 1000 && info.pendingWithdraw?.address) {
        const addr = info.pendingWithdraw.address;
        const amount = info.bmc;
        info.bmc = 0;
        info.pendingWithdraw = null;
        return sendMessage(chatId, `✅ Đã gửi yêu cầu rút *${amount} BMC* đến địa chỉ:\n\`${addr}\`\nVui lòng chờ xử lý.`);
      }
      return sendMessage(chatId, "⚠️ Không đủ số dư hoặc địa chỉ không hợp lệ.");
    }

    if (data === "cancel_withdraw") {
      userData[uid].pendingWithdraw = null;
      return sendMessage(chatId, "❌ Đã hủy yêu cầu rút.");
    }
  }

  res.sendStatus(200); // Gửi phản hồi cho Telegram để tránh timeout
});
