from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import logging
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cowrie_rush.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Telegram Bot Token for verification
TELEGRAM_BOT_TOKEN = os.getenv(
    'TELEGRAM_BOT_TOKEN', '8182701296:AAES69zVRtksLhQ2b7ci-Om8xIOhBM1e-5A')


def check_membership(user_id, channel_username):
    """Check if user is a member of the Telegram channel."""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getChatMember"
    params = {
        'chat_id': f'@{channel_username}',
        'user_id': user_id
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data.get('ok') and data.get('result', {}).get('status') in ['member', 'administrator', 'creator']:
            return True
    except Exception as e:
        logger.error(f"Error checking membership: {e}")
    return False

# Database Models


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    total_cwry = db.Column(db.Integer, default=0)
    usdt_balance = db.Column(db.Float, default=0.0)
    ton_balance = db.Column(db.Float, default=0.0)
    is_premium = db.Column(db.Boolean, default=False)
    tasks_completed = db.Column(db.Text, default='{}')  # JSON string for tasks


class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referrer_id = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=False)
    referred_id = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=False)
    referrer = db.relationship('User', foreign_keys=[referrer_id])
    referred = db.relationship('User', foreign_keys=[referred_id])


class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_cwry = db.Column(db.Integer, nullable=False)
    user = db.relationship('User')

# API Routes


@app.route('/api/user/<int:user_id>', methods=['GET', 'POST'])
def user_data(user_id):
    logger.info(f"Request to /api/user/{user_id} - Method: {request.method}")
    if request.method == 'GET':
        user = User.query.get(user_id)
        if user:
            logger.info(f"User {user_id} data retrieved successfully.")
            return jsonify({
                'id': user.id,
                'username': user.username,
                'name': user.name,
                'totalCwry': user.total_cwry,
                'usdtBalance': user.usdt_balance,
                'tonBalance': user.ton_balance,
                'isPremium': user.is_premium,
                'tasks': eval(user.tasks_completed)  # Convert string to dict
            })
        else:
            logger.warning(f"User {user_id} not found.")
            return jsonify({'error': 'User not found'}), 404
    elif request.method == 'POST':
        data = request.json
        logger.info(f"Updating user {user_id} with data: {data}")
        user = User.query.get(user_id)
        if not user:
            user = User(
                id=user_id,
                username=data.get('username', 'Player'),
                name=data.get('name', 'Anonymous'),
                total_cwry=data.get('totalCwry', 0),
                usdt_balance=data.get('usdtBalance', 0.0),
                ton_balance=data.get('tonBalance', 0.0),
                is_premium=data.get('isPremium', False),
                tasks_completed=str(data.get('tasks', {}))
            )
            db.session.add(user)
            logger.info(f"New user {user_id} created.")
        else:
            user.total_cwry = data.get('totalCwry', user.total_cwry)
            user.usdt_balance = data.get('usdtBalance', user.usdt_balance)
            user.ton_balance = data.get('tonBalance', user.ton_balance)
            user.tasks_completed = str(
                data.get('tasks', eval(user.tasks_completed)))
            logger.info(f"User {user_id} data updated.")
        db.session.commit()
        return jsonify({'message': 'User data updated'})


@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    logger.info("Request to /api/leaderboard")
    top_users = User.query.order_by(User.total_cwry.desc()).limit(100).all()
    leaderboard = [{'username': u.username, 'totalCwry': u.total_cwry}
                   for u in top_users]
    logger.info(f"Leaderboard retrieved: {len(leaderboard)} users.")
    return jsonify(leaderboard)


@app.route('/api/referrals/<int:user_id>', methods=['GET', 'POST'])
def referrals(user_id):
    logger.info(
        f"Request to /api/referrals/{user_id} - Method: {request.method}")
    if request.method == 'GET':
        refs = Referral.query.filter_by(referrer_id=user_id).all()
        referrals_list = []
        for ref in refs:
            referred_user = User.query.get(ref.referred_id)
            if referred_user:
                referrals_list.append({
                    'name': referred_user.name,
                    'totalCwry': referred_user.total_cwry
                })
        logger.info(
            f"Referrals for user {user_id}: {len(referrals_list)} referrals.")
        return jsonify(referrals_list)
    elif request.method == 'POST':
        data = request.json
        referred_id = data.get('referred_id')
        logger.info(
            f"Adding referral: referrer {user_id}, referred {referred_id}")
        if not Referral.query.filter_by(referrer_id=user_id, referred_id=referred_id).first():
            ref = Referral(referrer_id=user_id, referred_id=referred_id)
            db.session.add(ref)
            db.session.commit()
            logger.info("Referral added successfully.")
            return jsonify({'message': 'Referral added'})
        logger.warning("Referral already exists.")
        return jsonify({'message': 'Referral already exists'})


@app.route('/api/tasks/complete/<int:user_id>/<task_id>', methods=['POST'])
def complete_task(user_id, task_id):
    logger.info(f"Request to /api/tasks/complete/{user_id}/{task_id}")
    user = User.query.get(user_id)
    if user:
        tasks = eval(user.tasks_completed)
        if task_id not in tasks:
            # Verify membership for Telegram tasks
            if task_id == 'tg1' and not check_membership(user_id, 'cowrierush'):
                logger.warning(
                    f"User {user_id} not member of cowrierush for tg1.")
                return jsonify({'error': 'Membership verification failed'}), 400
            if task_id == 'tg2' and not check_membership(user_id, 'cowrierush'):
                logger.warning(
                    f"User {user_id} not member of cowrierush for tg2.")
                return jsonify({'error': 'Membership verification failed'}), 400
            tasks[task_id] = True
            user.tasks_completed = str(tasks)
            # Add rewards based on task
            if task_id in ['tg1', 'tg2']:
                user.total_cwry += 100
                logger.info(
                    f"Task {task_id} completed for user {user_id}, reward: 100 cwry.")
            elif task_id == 'ref5':
                user.total_cwry += 50
                logger.info(
                    f"Task {task_id} completed for user {user_id}, reward: 50 cwry.")
            elif task_id == 'ref20':
                user.total_cwry += 100
                logger.info(
                    f"Task {task_id} completed for user {user_id}, reward: 100 cwry.")
            db.session.commit()
            return jsonify({'message': 'Task completed', 'reward': user.total_cwry})
        else:
            logger.warning(
                f"Task {task_id} already completed for user {user_id}.")
    logger.error(f"Task completion failed for user {user_id}, task {task_id}.")
    return jsonify({'error': 'Task completion failed'}), 400


if __name__ == '__main__':
    logger.info("Starting Flask API server...")
    with app.app_context():
        db.create_all()
    app.run(debug=True)
