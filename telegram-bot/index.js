const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

// Lưu ngôn ngữ và trạng thái thêm nút Apps
const userLangMap = new Map();
const userAppsMap = new Map();

function getTexts(lang, fullName, userMessage, withApps = false) {
  const appsButton = [{ text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" }];
  const channelButton = [{ text: "📢 Channel", url: "https://t.me/bmassk3_channel" }];
  const baseButtons = withApps ? [appsButton, channelButton] : [channelButton];

  const texts = {
    vi: {
      caption: `Xin chào *${fullName}*.\nChào mừng đến với Mini App của BmassHD.\n\nBạn vừa gửi: *${userMessage}*\n\nBạn thắc mắc điều gì, chat với support nhé [@BmassK3](https://t.me/BmassK3)`,
      selected: "Bạn đã chọn ngôn ngữ *Tiếng Việt*.",
      slogan: "Trường Sa, Hoàng Sa là của Việt Nam.",
      keyboard: baseButtons
    },
    en: {
      caption: `Hello *${fullName}*.\nWelcome to BmassHD's Mini App.\n\nYou just sent: *${userMessage}*\n\nIf you have any questions, chat with support [@BmassK3](https://t.me/BmassK3)`,
      selected: "You selected *English*.",
      slogan: "Truong Sa and Hoang Sa belong to Vietnam.",
      keyboard: baseButtons
    }
  };

  return texts[lang] || texts.vi;
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

async function sendMessage(chatId, text, keyboard = null) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown"
  };
  if (keyboard) payload.reply_markup = { inline_keyboard: keyboard };
  return axios.post(`${TELEGRAM_API}/sendMessage`, payload);
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

async function sendVietnameseActivation(chatId) {
  const keyboard = [
    [{ text: "Kích hoạt toàn bộ hệ thống Tiếng Việt", url: "https://t.me/setlanguage/abcxyz" }]
  ];
  await sendMessage(chatId, "Chúc mừng! Bạn đã kích hoạt thành công Tiếng Việt.", keyboard);
}

async function askAddApps(chatId) {
  const keyboard = [
    [
      { text: "✅ Có", callback_data: "add_apps_yes" },
      { text: "❌ Không", callback_data: "add_apps_no" }
    ]
  ];
  await sendMessage(chatId, "Bạn có muốn thêm nút *Apps* vào menu không?", keyboard);
}

async function sendMainMenu(chatId, fullName, userMessage = '') {
  const lang = userLangMap.get(chatId) || 'vi';
  const withApps = userAppsMap.get(chatId) === true;
  const texts = getTexts(lang, fullName, userMessage, withApps);
  await sendPhoto(chatId, texts.caption, texts.keyboard);
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
      await sendMainMenu(chatId, fullName, text);
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

      const texts = getTexts(lang, fullName, '');
      await sendMessage(chatId, texts.selected);
      await sendMessage(chatId, texts.slogan);

      if (lang === 'vi') {
        await sendVietnameseActivation(chatId);
      }

      await askAddApps(chatId);
    }

    if (data === 'add_apps_yes') {
      userAppsMap.set(chatId, true);
      await sendMessage(chatId, "Đã thêm nút *Apps* vào menu!");
      await sendMainMenu(chatId, fullName);
    }

    if (data === 'add_apps_no') {
      userAppsMap.set(chatId, false);
      await sendMessage(chatId, "Bạn đã chọn không thêm nút *Apps*.");
      await sendMainMenu(chatId, fullName);
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot is running on port ${PORT}`));
