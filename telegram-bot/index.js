const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

// Lưu ngôn ngữ người dùng: { userId: 'vi' | 'en' }
const userLangMap = new Map();

function getLangText(lang, type, fullName = '', userMessage = '') {
  const texts = {
    vi: {
      caption: `Xin chào *${fullName}*.\nChào mừng đến với Mini App của BmassHD.\n\nBạn vừa gửi: *${userMessage}*\n\nBạn thắc mắc điều gì, chat với support nhé [@BmassK3](https://t.me/BmassK3)`,
      language_select: "Chọn ngôn ngữ:",
      buttons: [
        [{ text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" }],
        [{ text: "📢 Channel", url: "https://t.me/bmassk3_channel" }]
      ]
    },
    en: {
      caption: `Hello *${fullName}*.\nWelcome to BmassHD's Mini App.\n\nYou just sent: *${userMessage}*\n\nIf you have any questions, chat with support [@BmassK3](https://t.me/BmassK3)`,
      language_select: "Choose your language:",
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

    if (text.toLowerCase().includes('/start')) {
      // Gửi menu chọn ngôn ngữ nếu chưa có
      if (!userLangMap.has(chatId)) {
        await sendLanguageMenu(chatId);
        return res.sendStatus(200);
      }
    }

    await sendMenu(chatId, fullName, text);
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.from.id;
    const fullName = `${query.from.first_name || ''} ${query.from.last_name || ''}`.trim();
    const data = query.data;

    if (data === 'lang_vi') {
      userLangMap.set(chatId, 'vi');
      await sendMessage(chatId, "Bạn đã chọn ngôn ngữ *Tiếng Việt*.");
      await sendMenu(chatId, fullName);
    } else if (data === 'lang_en') {
      userLangMap.set(chatId, 'en');
      await sendMessage(chatId, "You selected *English*.");
      await sendMenu(chatId, fullName);
    } else {
      await sendMenu(chatId, fullName, `Bạn vừa bấm: ${data}`);
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot is running on port ${PORT}`));
