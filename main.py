import threading
import subprocess
import sys
import os


def run_api():
    """Run the Flask API server."""
    try:
        # Run api.py as a subprocess
        subprocess.run([sys.executable, 'api.py'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running API: {e}")


def run_bot():
    """Run the Telegram bot."""
    try:
        # Run bot.py as a subprocess
        subprocess.run([sys.executable, 'bot.py'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running bot: {e}")


if __name__ == '__main__':
    print("Starting Cowrie Rush services...")

    # Run API in a separate thread
    api_thread = threading.Thread(target=run_api, daemon=True)
    api_thread.start()

    # Run bot in the main thread (since it polls indefinitely)
    run_bot()
