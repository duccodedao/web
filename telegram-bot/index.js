const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

// Lưu ngôn ngữ và cài đặt người dùng
const userLangMap = new Map();
const userSettings = new Map();
const priceIntervals = new Map();

// Lấy giá TON từ CoinGecko
async function getTonPrice() {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids: "toncoin",
        vs_currencies: "usd"
      }
    });
    return response.data.toncoin.usd;
  } catch (error) {
    console.error("Lỗi khi lấy giá TON:", error);
    return null;
  }
}

// Tính phần trăm thay đổi giá
function calculatePercentageChange(oldPrice, newPrice) {
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

function getLangText(lang, type, fullName = '', userMessage = '') {
  const texts = {
    vi: {
      caption: `Xin chào *${fullName}*.\nChào mừng đến với Mini App của BmassHD.\n\nBạn vừa gửi: *${userMessage}*\n\nBạn thắc mắc điều gì, chat với support nhé [@BmassK3](https://t.me/BmassK3)`,
      language_select: "Chọn ngôn ngữ:",
      slogan: "Trường Sa, Hoàng Sa là của Việt Nam.",
      selected: "Bạn đã chọn ngôn ngữ *Tiếng Việt*.",
      buttons: [
        [{ text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" }],
        [{ text: "📢 Channel", url: "https://t.me/bmassk3_channel" }],
        [{ text: "🌐 Kích hoạt hệ thống tiếng Việt", url: "https://t.me/setlanguage/abcxyz" }]
      ]
    },
    en: {
      caption: `Hello *${fullName}*.\nWelcome to BmassHD's Mini App.\n\nYou just sent: *${userMessage}*\n\nIf you have any questions, chat with support [@BmassK3](https://t.me/BmassK3)`,
      language_select: "Choose your language:",
      slogan: "Truong Sa and Hoang Sa belong to Vietnam.",
      selected: "You selected *English*.",
      buttons: [
        [{ text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" }],
        [{ text: "📢 Channel", url: "https://t.me/bmassk3_channel" }]
      ]
    }
  };

  return texts[lang || 'vi'][type];
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

async function sendMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown"
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  return axios.post(`${TELEGRAM_API}/sendMessage`, payload);
}

async function sendKeyboardButtons(chatId, text) {
  return axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [
        [{ text: "🧩 Apps", web_app: { url: "https://t.me/bmassk3_bot/?startapp=" } }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
}

async function sendLanguageMenu(chatId) {
  const keyboard = [
    [
      { text: "Tiếng Việt", callback_data: "lang_vi" },
      { text: "English", callback_data: "lang_en" }
    ]
  ];
  await sendPhoto(chatId, "Chọn ngôn ngữ / Choose your language:", keyboard);
}

async function sendMenu(chatId, fullName, userMessage = '') {
  const lang = userLangMap.get(chatId) || 'vi';
  const caption = getLangText(lang, 'caption', fullName, userMessage);
  const buttons = getLangText(lang, 'buttons');

  await sendPhoto(chatId, caption, buttons);
}

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
    const text = msg.text || '';

    if (!userLangMap.has(chatId)) {
      await sendLanguageMenu(chatId);
    } else {
      await sendMenu(chatId, fullName, text);
    }
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const fullName = `${query.from.first_name || ''} ${query.from.last_name || ''}`.trim();
    const data = query.data;

    if (data.startsWith("lang_")) {
      const lang = data.split("_")[1];
      userLangMap.set(chatId, lang);
      await sendMessage(chatId, getLangText(lang, 'selected'));
      await sendMenu(chatId, fullName);
    }
  }

  res.sendStatus(200);
 
