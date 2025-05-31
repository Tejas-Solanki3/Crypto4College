const TRANSACTIONS_KEY = 'crypto4college_transactions';

function getUserBalance(username) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(u => u.username === username);
    return user ? user.balance : 0;
}

function updateUserBalance(username, newBalance) {
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users[userIndex].balance = parseFloat(newBalance.toFixed(2)); // Ensure 2 decimal places
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        // If this is the logged-in user, update their session data too
        const loggedInUser = getCurrentUser();
        if (loggedInUser && loggedInUser.username === username) {
            loggedInUser.balance = users[userIndex].balance;
            localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(loggedInUser));
        }
        return true;
    }
    return false;
}


function sendTokens(senderUsername, recipientUsername, amount) {
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount.");
        return false;
    }

    const sender = (JSON.parse(localStorage.getItem(USERS_KEY)) || []).find(u => u.username === senderUsername);
    const recipient = (JSON.parse(localStorage.getItem(USERS_KEY)) || []).find(u => u.username === recipientUsername);

    if (!sender) {
        alert("Sender not found.");
        return false;
    }
    if (!recipient) {
        alert("Recipient not found.");
        return false;
    }
    if (sender.balance < amount) {
        alert("Insufficient funds.");
        return false;
    }

    // Update balances
    updateUserBalance(senderUsername, sender.balance - amount);
    updateUserBalance(recipientUsername, recipient.balance + amount);

    // Record transaction
    addTransaction(senderUsername, recipientUsername, amount, "P2P Transfer");
    
    alert(`Successfully sent ${amount} CC to ${recipientUsername}.`);
    // Potentially update UI here or trigger a refresh
    return true;
}


// This would be called from dashboard.html's script part
function loadDashboardData() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const balanceElement = document.getElementById('cc-balance');
        if (balanceElement) {
            balanceElement.textContent = getUserBalance(currentUser.username).toFixed(2);
        }
        // Also load brief transaction list (from transactions.js)
        displayRecentTransactions(currentUser.username, 'transaction-list-brief', 5);
    }
}