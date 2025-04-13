const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

const userLangMap = new Map();

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

async function sendMessage(chatId, text) {
  return axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown"
  });
}

async function sendKeyboardButtons(chatId, text) {
  return axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: {
      keyboard: [
        [{ text: "🧩 Apps" }]
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

    if (data === 'lang_vi' || data === 'lang_en') {
      const lang = data.split('_')[1];
      userLangMap.set(chatId, lang);

      await sendMessage(chatId, getLangText(lang, 'selected'));
      await sendMessage(chatId, getLangText(lang, 'slogan'));
      await sendMenu(chatId, fullName);

      // Sau khi chọn ngôn ngữ xong thì hỏi người dùng có muốn hiển thị bàn phím apps không
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: "Bạn có muốn hiển thị nút Apps ngay trên bàn phím không?",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Có", callback_data: "show_apps_keyboard" }],
            [{ text: "Không", callback_data: "hide_apps_keyboard" }]
          ]
        }
      });
    }

    if (data === "show_apps_keyboard") {
      await sendKeyboardButtons(chatId, "Đã bật bàn phím chứa nút Apps!");
    }

    if (data === "hide_apps_keyboard") {
      await sendMessage(chatId, "Bạn đã chọn không hiển thị bàn phím Apps.");
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot is running on port ${PORT}`));
