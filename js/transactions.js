// const TRANSACTIONS_KEY = 'crypto4college_transactions'; // (already in wallet.js, ensure it's consistent)

function addTransaction(from, to, amount, type, details = {}) {
    let transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
    const newTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        from: from, // username
        to: to,     // username or 'System' (e.g., for fees)
        amount: parseFloat(amount.toFixed(2)),
        type: type, // "P2P Transfer", "Fee Payment", "Event Ticket", "Token Mint"
        timestamp: new Date().toISOString(),
        details: details // e.g. { eventName: "Spring Fest" }
    };
    transactions.unshift(newTransaction); // Add to the beginning for recent first
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function getUserTransactions(username) {
    const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
    return transactions.filter(tx => tx.from === username || tx.to === username)
                       .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function displayRecentTransactions(username, elementId, count = 5) {
    const listElement = document.getElementById(elementId);
    if (!listElement) return;
    listElement.innerHTML = ''; // Clear previous entries

    const transactions = getUserTransactions(username).slice(0, count);

    if (transactions.length === 0) {
        listElement.innerHTML = '<li>No transactions yet.</li>';
        return;
    }

    transactions.forEach(tx => {
        const li = document.createElement('li');
        li.classList.add('transaction-item');
        const date = new Date(tx.timestamp).toLocaleDateString();
        const time = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let description = '';
        let amountClass = '';
        let amountPrefix = '';

        if (tx.from === username) { // Sent
            description = `Sent to ${tx.to}`;
            amountClass = 'negative';
            amountPrefix = '-';
        } else { // Received
            description = `Received from ${tx.from}`;
            amountClass = 'positive';
            amountPrefix = '+';
        }
        if (tx.type === "Fee Payment") description = `Paid ${tx.details.feeName || 'fee'} to ${tx.to}`;
        if (tx.type === "Event Ticket") description = `Bought ${tx.details.eventName || 'ticket'} from ${tx.to}`;
        if (tx.type === "Token Mint" && tx.to === username) description = `Tokens minted by Admin`;
        

        li.innerHTML = `
            <div class="transaction-details">
                <p><strong>${tx.type}</strong>: ${description}</p>
                <p><small>${date} at ${time}</small></p>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}${tx.amount.toFixed(2)} CC
            </div>
        `;
        listElement.appendChild(li);
    });
}