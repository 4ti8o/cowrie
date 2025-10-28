# TODO List for Cowrie Rush Fixes

## 1. Fix Claim Button Activation

- [x] Modify js/app.js: Call updateStatusBar() in loadUserData() and after totalCwry changes to enable claim button when >= 100000.

## 2. Fix Wallet Showing Blank Page

- [x] Modify js/app.js: In loadPage('wallet'), update the existing spans instead of overwriting innerHTML.

## 3. Add Telegram Channel Membership Verification

- [x] Modify api.py: Import requests, add check_membership function using Telegram Bot API.
- [x] Modify api.py: In complete_task, verify membership for tg1/tg2 before awarding rewards.

## 4. Update CWRY Balance in Wallet

- [x] Modify js/app.js: Calculate CWRY balance as sum of referral earnings + claimed task earnings.

## 5. Use Icons Instead of Emojis

- [x] Modify js/app.js: Replace emojis in leaderboard with icons (e.g., text-based or CSS classes).

## 6. Update Requirements

- [x] Modify requirements.txt: Add 'requests' for API calls.

## 7. Testing and Followup

- [x] Test the app locally to ensure fixes work.
- [x] Install dependencies if needed.

## 8. UI Improvements

- [ ] Modify js/app.js: After task completion, show a check mark instead of hiding the button, and prevent redoing the task.
