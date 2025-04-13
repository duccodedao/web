const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_API = 'https://api.telegram.org/bot6789490938:AAFkhwkeeqrsyBTzE0I6uKAiKCSz0qjMWWs';
const IMAGE_URL = "https://duccodedao.github.io/web/logo-coin/IMG_1613.png";

// Lưu ngôn ngữ và trạng thái "có thêm nút Apps không"
const userLangMap = new Map();
const userAppsMap = new Map();

// Gửi ảnh với caption và inline keyboard
async function sendPhoto(chatId, caption, keyboard = []) {
  return axios.post(`${TELEGRAM_API}/sendPhoto`, {
    chat_id: chatId,
    photo: IMAGE_URL,
    caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
  });
}

// Gửi tin nhắn
async function sendMessage(chatId, text, keyboard = null) {
  return axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined
  });
}

// Gửi menu chọn ngôn ngữ
async function sendLanguageMenu(chatId) {
  const keyboard = [
    [
      { text: "Tiếng Việt", callback_data: "lang_vi" },
      { text: "English", callback_data: "lang_en" }
    ]
  ];
  await sendPhoto(chatId, "Chọn ngôn ngữ / Choose your language:", keyboard);
}

// Nút kích hoạt hệ thống tiếng Việt
async function sendVietnameseActivationButton(chatId) {
  const keyboard = [
    [{ text: "Kích hoạt toàn bộ hệ thống Tiếng Việt", url: "https://t.me/setlanguage/abcxyz" }]
  ];
  await sendMessage(chatId, "Chúc mừng! Bạn đã kích hoạt thành công Tiếng Việt.", keyboard);
}

// Hỏi người dùng có muốn thêm nút Apps không
async function askAddAppsButton(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Có", callback_data: "add_apps_yes" },
        { text: "❌ Không", callback_data: "add_apps_no" }
      ]
    ]
  };
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: "Bạn có muốn thêm nút *Apps* vào menu không?",
    parse_mode: "Markdown",
    reply_markup: keyboard
  });
}

// Dữ liệu theo ngôn ngữ
function getLangText(lang, type, fullName = '', userMessage = '', withApps = false) {
  const baseButtons = {
    vi: [[{ text: "📢 Channel", url: "https://t.me/bmassk3_channel" }]],
    en: [[{ text: "📢 Channel", url: "https://t.me/bmassk3_channel" }]]
  };

  const appsButton = [{ text: "🧩 Apps", url: "https://t.me/bmassk3_bot/?startapp=" }];

  return {
    caption: {
      vi: `Xin chào *${fullName}*.\nChào mừng đến với Mini App của BmassHD.\n\nBạn vừa gửi: *${userMessage}*\n\nBạn thắc mắc điều gì, chat với support nhé [@BmassK3](https://t.me/BmassK3)`,
      en: `Hello *${fullName}*.\nWelcome to BmassHD's Mini App.\n\nYou just sent: *${userMessage}*\n\nIf you have any questions, chat with support [@BmassK3](https://t.me/BmassK3)`
    }[lang],
    language_select: lang === 'vi' ? "Chọn ngôn ngữ:" : "Choose your language:",
    slogan: lang === 'vi' ? "Trường Sa, Hoàng Sa là của Việt Nam." : "Truong Sa and Hoang Sa belong to Vietnam.",
    selected: lang === 'vi' ? "Bạn đã chọn ngôn ngữ *Tiếng Việt*." : "You selected *English*.",
    buttons: withApps ? [appsButton, ...baseButtons[lang]] : baseButtons[lang]
  };
}

// Gửi menu chính
async function sendMenu(chatId, fullName, userMessage = '') {
  const lang = userLangMap.get(chatId) || 'vi';
  const withApps = userAppsMap.get(chatId) === true;
  const caption = getLangText(lang, 'caption', fullName, userMessage);
  const buttons = getLangText(lang, 'buttons', '', '', withApps);
  await sendPhoto(chatId, caption, buttons);
}

// Webhook xử lý từ Telegram
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

      if (lang === 'vi') {
        await sendVietnameseActivationButton(chatId);
      }

      await askAddAppsButton(chatId);
    }

    if (data === 'add_apps_yes') {
      userAppsMap.set(chatId, true);
      await sendMessage(chatId, "Đã thêm nút *Apps* vào menu!");
      await sendMenu(chatId, fullName);
    }

    if (data === 'add_apps_no') {
      userAppsMap.set(chatId, false);
      await sendMessage(chatId, "Bạn đã chọn không thêm nút *Apps*.");
      await sendMenu(chatId, fullName);
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot is running on port ${PORT}`));
