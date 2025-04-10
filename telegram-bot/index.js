app.post(`/webhook`, async (req, res) => {
  const message = req.body.message;

  if (message) {
    const chatId = message.chat.id;
    const fullName = `${message.from.first_name || ''} ${message.from.last_name || ''}`.trim();
    const text = message.text || '';

    const referrals = loadReferrals();

    // Nếu là lệnh /count thì gửi số lượt mời
    if (text === '/count') {
      const count = referrals[chatId]?.count || 0;
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Bạn đã mời được: *${count}* người`,
        parse_mode: "Markdown"
      });
      return res.sendStatus(200);
    }

    // Nếu có mã mời (ref)
    const isReferral = text.startsWith('/start ');
    const refCode = isReferral ? text.split(' ')[1] : null;

    if (refCode && refCode !== String(chatId)) {
      if (!referrals[chatId]) {
        referrals[chatId] = { invitedBy: refCode };

        if (!referrals[refCode]) referrals[refCode] = { invitedBy: null, count: 0 };
        referrals[refCode].count = (referrals[refCode].count || 0) + 1;

        saveReferrals(referrals);
      }
    }

    const caption = `Chào mừng *${fullName}* đến với Mini App của BmassHD`;

    await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: chatId,
      photo: 'http://duccodedao.github.io/web/logo-coin/IMG_1613.png',
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🧩 Apps", url: `https://t.me/bmassk3_bot/?startapp=${chatId}` },
            { text: "📢 Channel", url: "https://t.me/bmassk3_channel" }
          ]
        ]
      }
    });
  }

  res.sendStatus(200);
});
const fs = require('fs');
const path = require('path');

function loadReferrals() {
  const filePath = path.join(__dirname, 'referrals.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    return {};
  }
}

function saveReferrals(data) {
  const filePath = path.join(__dirname, 'referrals.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
