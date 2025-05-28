// (This file would contain functions to call createFee, createEvent, view all users, view all transactions, mint tokens etc.)
// Ensure admin functions check if the logged-in user is actually an admin.

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.is_admin) {
        alert("Access Denied. Admins only.");
        window.location.href = 'index.html';
        return;
    }
    // Populate admin dashboard with controls
    // e.g., forms for creating fees, events, minting tokens.
    setupAdminControls();
    loadAdminData(); // display users, all txs, etc.
});

function setupAdminControls() {
    const adminActionsContainer = document.getElementById('admin-actions'); // Assume this div exists in admin.html
    if (!adminActionsContainer) return;

    adminActionsContainer.innerHTML = `
        <section>
            <h2>User Management</h2>
            <div id="user-list-admin">Loading users...</div>
        </section>
        <section>
            <h2>Token Minting</h2>
            <input type="text" id="mint-recipient" placeholder="Recipient Username">
            <input type="number" id="mint-amount" placeholder="Amount to Mint">
            <button id="mint-tokens-btn">Mint Tokens</button>
        </section>
        <section>
            <h2>Fee Management</h2>
            <input type="text" id="fee-name" placeholder="Fee Name (e.g., Tuition Q1)">
            <input type="number" id="fee-amount" placeholder="Amount (CC)">
            <input type="date" id="fee-due-date">
            <button id="create-fee-btn">Create Fee</button>
            <div id="fee-list-admin">Loading fees...</div>
        </section>
        <section>
            <h2>Event Management</h2>
            <input type="text" id="event-name" placeholder="Event Name (e.g., Spring Fest)">
            <input type="number" id="event-price" placeholder="Ticket Price (CC)">
            <input type="number" id="event-tickets" placeholder="Tickets Available">
            <button id="create-event-btn">Create Event</button>
            <div id="event-list-admin">Loading events...</div>
        </section>
        <section>
            <h2>All Transactions</h2>
            <ul id="all-transactions-list">Loading all transactions...</ul>
        </section>
    `;

    // Event Listeners for admin actions
    document.getElementById('mint-tokens-btn').addEventListener('click', handleMintTokens);
    document.getElementById('create-fee-btn').addEventListener('click', handleCreateFeeAdmin);
    document.getElementById('create-event-btn').addEventListener('click', handleCreateEventAdmin);
}

function loadAdminData() {
    displayAllUsersAdmin();
    displayAllFeesAdmin();
    displayAllEventsAdmin();
    displayAllTransactionsAdmin();
}

function handleMintTokens() {
    const currentUser = getCurrentUser();
    const recipientUsername = document.getElementById('mint-recipient').value.trim();
    const amount = parseFloat(document.getElementById('mint-amount').value);

    if (!recipientUsername || isNaN(amount) || amount <= 0) {
        alert("Please enter valid recipient and amount.");
        return;
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const recipient = users.find(u => u.username === recipientUsername);

    if (!recipient) {
        alert("Recipient user not found.");
        return;
    }

    // "Minting" simply means increasing a user's balance from a system/admin perspective.
    // For this simulation, the admin effectively creates CC out of thin air for a user.
    updateUserBalance(recipientUsername, recipient.balance + amount);
    addTransaction(ADMIN_USERNAME, recipientUsername, amount, "Token Mint", { mintedBy: currentUser.username });
    alert(`${amount} CC minted to ${recipientUsername}.`);
    // Refresh relevant parts of admin UI and potentially user's balance if they are viewing it
    loadAdminData(); // simple refresh
}

function handleCreateFeeAdmin() {
    const currentUser = getCurrentUser();
    const feeName = document.getElementById('fee-name').value.trim();
    const feeAmount = document.getElementById('fee-amount').value;
    const feeDueDate = document.getElementById('fee-due-date').value;

    if (!feeName || !feeAmount || !feeDueDate) {
        alert("Please fill all fee fields.");
        return;
    }
    if (createFee(feeName, feeAmount, feeDueDate, currentUser)) {
        document.getElementById('fee-name').value = '';
        document.getElementById('fee-amount').value = '';
        document.getElementById('fee-due-date').value = '';
        displayAllFeesAdmin(); // Refresh list
    }
}

function handleCreateEventAdmin() {
    const currentUser = getCurrentUser();
    const eventName = document.getElementById('event-name').value.trim();
    const eventPrice = document.getElementById('event-price').value;
    const eventTickets = document.getElementById('event-tickets').value;

    if (!eventName || !eventPrice || !eventTickets) {
        alert("Please fill all event fields.");
        return;
    }
    if (createEvent(eventName, eventPrice, eventTickets, currentUser)) {
        document.getElementById('event-name').value = '';
        document.getElementById('event-price').value = '';
        document.getElementById('event-tickets').value = '';
        displayAllEventsAdmin(); // Refresh list
    }
}

// --- Display functions for admin panel ---
function displayAllUsersAdmin() {
    const userListDiv = document.getElementById('user-list-admin');
    if (!userListDiv) return;
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    let html = '<ul>';
    users.forEach(user => {
        html += `<li>${user.username} (${user.email}) - Balance: ${user.balance.toFixed(2)} CC ${user.is_admin ? '(Admin)' : ''}</li>`;
    });
    html += '</ul>';
    userListDiv.innerHTML = html;
}

function displayAllFeesAdmin() {
    const feeListDiv = document.getElementById('fee-list-admin');
    if (!feeListDiv) return;
    const fees = JSON.parse(localStorage.getItem(COLLEGE_FEES_KEY)) || [];
    let html = '<ul>';
    fees.forEach(fee => {
        html += `<li>${fee.name} - ${fee.amount.toFixed(2)} CC (Due: ${fee.dueDate}) - ${fee.active ? 'Active' : 'Inactive'}</li>`;
    });
    html += '</ul>';
    feeListDiv.innerHTML = html;
}

function displayAllEventsAdmin() {
    const eventListDiv = document.getElementById('event-list-admin');
    if (!eventListDiv) return;
    const events = JSON.parse(localStorage.getItem(COLLEGE_EVENTS_KEY)) || [];
    let html = '<ul>';
    events.forEach(event => {
        html += `<li>${event.name} - ${event.price.toFixed(2)} CC (Tickets: ${event.ticketsAvailable}) - ${event.active ? 'Active' : 'Inactive'}</li>`;
    });
    html += '</ul>';
    eventListDiv.innerHTML = html;
}

function displayAllTransactionsAdmin() {
    const txListUl = document.getElementById('all-transactions-list');
    if (!txListUl) return;
    const transactions = (JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [])
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    let html = '';
    if (transactions.length === 0) {
        txListUl.innerHTML = '<li>No transactions recorded yet.</li>';
        return;
    }
    transactions.forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleString();
        html += `<li>
            <strong>${tx.type}</strong>: ${tx.from} to ${tx.to} - ${tx.amount.toFixed(2)} CC 
            <br><small>ID: ${tx.id}, Time: ${date}</small>
            ${tx.details && Object.keys(tx.details).length > 0 ? `<br><small>Details: ${JSON.stringify(tx.details)}</small>` : ''}
        </li>`;
    });
    txListUl.innerHTML = html;
}