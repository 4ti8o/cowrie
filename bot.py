import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Replace with your bot token from BotFather
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN',
                  '8182701296:AAES69zVRtksLhQ2b7ci-Om8xIOhBM1e-5A')

# Replace with your hosted web app URL
WEB_APP_URL = os.getenv(
    'WEB_APP_URL', 'https://regal-bonbon-b848a0.netlify.app')


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    logger.info(f"User {user.id} ({user.username}) started the bot.")
    keyboard = [
        [InlineKeyboardButton("Open Cowrie Rush", web_app={
                              "url": WEB_APP_URL})]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_html(
        rf"Hi {user.mention_html()}! Welcome to Cowrie Rush! 🐚💰",
        reply_markup=reply_markup
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    user = update.effective_user
    logger.info(f"User {user.id} ({user.username}) requested help.")
    await update.message.reply_text("Use /start to begin playing Cowrie Rush!")


def main() -> None:
    """Start the bot."""
    logger.info("Starting the Telegram bot...")
    # Create the Application and pass it your bot's token.
    application = Application.builder().token(TOKEN).build()

    # on different commands - answer in Telegram
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))

    # Run the bot until the user presses Ctrl-C
    logger.info("Bot is running and polling for updates.")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
