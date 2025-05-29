function displayUserGreeting() {
    const currentUser = getCurrentUser(); // from auth.js
    const greetingElement = document.getElementById('user-greeting');
    if (currentUser && greetingElement) {
        greetingElement.textContent = `Hi, ${currentUser.username}!`;
    }
}

// Could add more common DOM update functions here.
// For example, to populate the forms in wallet.html, fees.html, events.html
// and handle their submissions, calling the respective functions from
// wallet.js and smartContracts.js

// --- For wallet.html ---
function setupWalletPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    document.getElementById('wallet-address').textContent = currentUser.username; // Or a generated ID
    document.getElementById('wallet-balance').textContent = getUserBalance(currentUser.username).toFixed(2);

    const sendForm = document.getElementById('send-cc-form');
    if (sendForm) {
        sendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const recipient = document.getElementById('recipient-address').value;
            const amount = document.getElementById('send-amount').value;
            const memo = document.getElementById('send-memo').value; // Memo not used in current backend logic but good for UI

            if (sendTokens(currentUser.username, recipient, amount)) {
                // Success
                document.getElementById('wallet-balance').textContent = getUserBalance(currentUser.username).toFixed(2);
                displayUserTransactions(currentUser.username, 'transaction-history-full'); // Refresh history
                sendForm.reset();
            }
        });
    }
    displayUserTransactions(currentUser.username, 'transaction-history-full');
}

// --- For fees.html ---
function setupFeesPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const feesListDiv = document.getElementById('college-fees-list');
    if (!feesListDiv) return;

    const activeFees = getActiveFees(); // from smartContracts.js
    let userPurchases = (JSON.parse(localStorage.getItem(USER_PURCHASES_KEY)) || {})[currentUser.username];
    let paidFeeIds = userPurchases ? userPurchases.fees.map(f => f.feeId) : [];

    if (activeFees.length === 0) {
        feesListDiv.innerHTML = '<p>No outstanding fees at the moment.</p>';
        return;
    }

    let html = '<ul>';
    activeFees.forEach(fee => {
        const isPaid = paidFeeIds.includes(fee.id);
        html += `
            <li>
                <h4>${fee.name}</h4>
                <p>Amount: ${fee.amount.toFixed(2)} CC</p>
                <p>Due Date: ${new Date(fee.dueDate).toLocaleDateString()}</p>
                ${isPaid ? 
                    '<button disabled>Paid</button>' : 
                    `<button onclick="handlePayFee('${currentUser.username}', '${fee.id}')">Pay Fee</button>`
                }
            </li>
        `;
    });
    html += '</ul>';
    feesListDiv.innerHTML = html;
}

function handlePayFee(username, feeId) {
    if (payCollegeFee(username, feeId)) { // from smartContracts.js
        // Refresh page or relevant sections
        setupFeesPage(); // Re-render fee list
        // Also update balance display if it's visible on this page or in header
        const balanceElement = document.getElementById('cc-balance'); // If header balance is present
        if (balanceElement) {
            balanceElement.textContent = getUserBalance(username).toFixed(2);
        }
         // Refresh main dashboard data if that's what's being shown
        if(document.getElementById('transaction-list-brief')) {
            loadDashboardData();
        }
    }
}

// --- For events.html ---
function setupEventsPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const eventsListDiv = document.getElementById('college-events-list');
    if (!eventsListDiv) return;

    const activeEvents = getActiveEvents(); // from smartContracts.js
    let userPurchases = (JSON.parse(localStorage.getItem(USER_PURCHASES_KEY)) || {})[currentUser.username];
    let purchasedEventIds = userPurchases ? userPurchases.events.map(e => e.eventId) : [];


    if (activeEvents.length === 0) {
        eventsListDiv.innerHTML = '<p>No upcoming events to purchase tickets for.</p>';
        return;
    }

    let html = '<ul>';
    activeEvents.forEach(event => {
        // Check if user already bought a ticket for this specific event (simplistic, assumes 1 ticket per event per user)
        const hasTicket = purchasedEventIds.includes(event.id);
        html += `
            <li>
                <h4>${event.name}</h4>
                <p>Price: ${event.price.toFixed(2)} CC</p>
                <p>Tickets Left: ${event.ticketsAvailable}</p>
                ${hasTicket ? 
                    '<button disabled>Ticket Purchased</button>' :
                    (event.ticketsAvailable > 0 ? 
                        `<button onclick="handleBuyEventTicket('${currentUser.username}', '${event.id}')">Buy Ticket</button>` :
                        '<button disabled>Sold Out</button>')
                }
            </li>
        `;
    });
    html += '</ul>';
    eventsListDiv.innerHTML = html;
}


function handleBuyEventTicket(username, eventId) {
    if (buyEventTicket(username, eventId)) { // from smartContracts.js
        setupEventsPage(); // Re-render event list
        const balanceElement = document.getElementById('cc-balance'); // If header balance is present
        if (balanceElement) {
            balanceElement.textContent = getUserBalance(username).toFixed(2);
        }
        if(document.getElementById('transaction-list-brief')) {
            loadDashboardData();
        }
    }
}

// Make sure these setup functions are called on their respective pages
// For example, in wallet.html:
// <script> document.addEventListener('DOMContentLoaded', setupWalletPage); </script>
// In fees.html:
// <script> document.addEventListener('DOMContentLoaded', setupFeesPage); </script>
// etc.