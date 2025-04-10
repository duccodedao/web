import telebot
from telebot.types import LabeledPrice

# Bot Token
bot = telebot.TeleBot('7545800115:AAHiyoeL2SkxXGaecK0VdgBovlNfQxTJmBA')

# Provider token nếu bạn dùng thanh toán thật (hiện để trống)
PROVIDER_TOKEN = ""  # Thêm token thanh toán nếu có

orders = {}

@bot.message_handler(commands=['buy'])
def buy_product(message):
    chat_id = message.chat.id
    payload = str(chat_id) + "_" + str(len(orders) + 1)
    
    title = "Package"
    description = "Package info"
    currency = "XTR"
    amount = 1

    prices = [LabeledPrice(label=title, amount=amount)]

    try:
        bot.send_invoice(
            chat_id,
            title,
            description,
            payload,
            PROVIDER_TOKEN,
            currency,
            prices
        )
        orders[payload] = {"chat_id": chat_id, "amount": amount, "status": "pending"}
    except Exception as e:
        print(f"Lỗi: {e}")
        bot.reply_to(message, f"Lỗi: {e}")

@bot.pre_checkout_query_handler(func=lambda query: True)
def process_pre_checkout_query(query):
    bot.answer_pre_checkout_query(query.id, ok=True)

@bot.message_handler(content_types=['successful_payment'])
def process_successful_payment(message):
    payload = message.successful_payment.invoice_payload
    if payload in orders:
        order = orders[payload]
        order["status"] = "completed"
        bot.send_message(order["chat_id"], "Cảm ơn bạn đã thanh toán!")
        bot.send_message(order["chat_id"], "Truy cập gói VIP tại: https://bmasshd.click")
        print(f"Đơn hàng {payload} hoàn tất.")
    else:
        print(f"Cảnh báo: không rõ đơn hàng: {payload}")

bot.polling()
