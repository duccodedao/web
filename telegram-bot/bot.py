import telebot
from telebot.types import LabeledPrice

# your bot token
bot = telebot.TeleBot('7545800115:AAHiyoeL2SkxXGaecK0VdgBovlNfQxTJmBA')

# payment processing token getfrom @BotFather > /mybots > select bot > payments >select provider > token
PROVIDER_TOKEN = "5775769170:LIVE:TG_c4A9rGWGlUHeebFkaxreD18A"  # Optional 

# Dictionary to store payment information
# Structure: {payload: {"chat_id": id, "amount": amount, "status": status}}
orders = {}

# Handler for the /buy command to initiate payment process
@bot.message_handler(commands=['buy'])
def buy_product(message):
    chat_id = message.chat.id
    # Create unique payload for each order
    payload = str(chat_id) + "_" + str(len(orders) + 1)
    
    # Payment details
    title = "Package"
    description = "Package info"
    currency = "XTR"
    amount = 1

    prices = [LabeledPrice(label=title, amount=amount)]

    try:
        # Send invoice to user
        bot.send_invoice(
            chat_id,
            title,
            description,
            payload,
            PROVIDER_TOKEN,
            currency,
            prices
        )
        # Store order information
        orders[payload] = {"chat_id": chat_id, "amount": amount, "status": "pending"}
    except Exception as e:
        print(f"Error: {e}")
        bot.reply_to(message, f"Error: {e}")

# Pre-checkout handler - Validates payment before processing
# This is called when user clicks 'Pay' button
@bot.pre_checkout_query_handler(func=lambda query: True)
def process_pre_checkout_query(query):
    bot.answer_pre_checkout_query(query.id, ok=True)

# Handler for successful payments
# Triggered when payment is completed successfully
@bot.message_handler(content_types=['successful_payment'])
def process_successful_payment(message):
    payload = message.successful_payment.invoice_payload
    if payload in orders:
        order = orders[payload]
        order["status"] = "completed"
        bot.send_message(order["chat_id"], "Thank you!")
        print(f"Order {payload} completed.")
    else:
        print(f"Warning: Unknown order: {payload}")

# Start the bot
bot.polling()
