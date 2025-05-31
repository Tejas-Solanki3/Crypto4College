// const { updateUserBalance, addTransaction, getCurrentUser } = './wallet.js'; // (Illustrative, actual imports not like this in browser JS without modules)

const COLLEGE_FEES_KEY = 'crypto4college_fees';
const COLLEGE_EVENTS_KEY = 'crypto4college_events';
const USER_PURCHASES_KEY = 'crypto4college_user_purchases'; // To track what users bought

// --- Fee Related Functions ---
function createFee(feeName, amount, dueDate, adminUser) { // Admin function
    if (!adminUser || !adminUser.is_admin) {
        alert("Unauthorized: Only admins can create fees.");
        return false;
    }
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
        alert("Invalid fee amount.");
        return false;
    }
    let fees = JSON.parse(localStorage.getItem(COLLEGE_FEES_KEY)) || [];
    fees.push({ id: `fee_${Date.now()}`, name: feeName, amount: amount, dueDate: dueDate, active: true });
    localStorage.setItem(COLLEGE_FEES_KEY, JSON.stringify(fees));
    alert(`Fee "${feeName}" created.`);
    return true;
}

function getActiveFees() {
    const fees = JSON.parse(localStorage.getItem(COLLEGE_FEES_KEY)) || [];
    return fees.filter(fee => fee.active);
}

function payCollegeFee(userId, feeId) {
    const currentUser = (JSON.parse(localStorage.getItem(USERS_KEY)) || []).find(u => u.username === userId);
    const fee = (JSON.parse(localStorage.getItem(COLLEGE_FEES_KEY)) || []).find(f => f.id === feeId);

    if (!currentUser) { alert("User not found."); return false; }
    if (!fee) { alert("Fee not found."); return false; }
    if (currentUser.balance < fee.amount) {
        alert(`Insufficient balance to pay ${fee.name}. Required: ${fee.amount} CC, Available: ${currentUser.balance} CC.`);
        return false;
    }

    // "Smart Contract" Logic:
    // 1. Deduct from user
    updateUserBalance(currentUser.username, currentUser.balance - fee.amount);
    // 2. Credit to college admin/system (optional, or just burn)
    // For simplicity, let's assume fees go to the main admin account
    const adminUser = (JSON.parse(localStorage.getItem(USERS_KEY)) || []).find(u => u.username === ADMIN_USERNAME);
    if (adminUser) {
        updateUserBalance(ADMIN_USERNAME, adminUser.balance + fee.amount);
    }
    // 3. Record transaction
    addTransaction(currentUser.username, ADMIN_USERNAME, fee.amount, "Fee Payment", { feeName: fee.name, feeId: fee.id });
    // 4. Mark fee as paid for this user (or simply log it)
    let purchases = JSON.parse(localStorage.getItem(USER_PURCHASES_KEY)) || {};
    if (!purchases[currentUser.username]) purchases[currentUser.username] = { fees: [], events: [] };
    purchases[currentUser.username].fees.push({ feeId: fee.id, feeName: fee.name, amount: fee.amount, date: new Date().toISOString() });
    localStorage.setItem(USER_PURCHASES_KEY, JSON.stringify(purchases));

    alert(`${fee.name} paid successfully!`);
    return true;
}

// --- Event Related Functions ---
function createEvent(eventName, price, ticketsAvailable, adminUser) { // Admin function
    if (!adminUser || !adminUser.is_admin) {
        alert("Unauthorized: Only admins can create events.");
        return false;
    }
    price = parseFloat(price);
    ticketsAvailable = parseInt(ticketsAvailable);
    if (isNaN(price) || price <= 0 || isNaN(ticketsAvailable) || ticketsAvailable <=0) {
        alert("Invalid event details.");
        return false;
    }
    let events = JSON.parse(localStorage.getItem(COLLEGE_EVENTS_KEY)) || [];
    events.push({ id: `event_${Date.now()}`, name: eventName, price: price, ticketsAvailable: ticketsAvailable, active: true });
    localStorage.setItem(COLLEGE_EVENTS_KEY, JSON.stringify(events));
    alert(`Event "${eventName}" created.`);
    return true;
}

function getActiveEvents() {
    const events = JSON.parse(localStorage.getItem(COLLEGE_EVENTS_KEY)) || [];
    return events.filter(event => event.active && event.ticketsAvailable > 0);
}

function buyEventTicket(userId, eventId) {
    const currentUser = (JSON.parse(localStorage.getItem(USERS_KEY)) || []).find(u => u.username === userId);
    let events = JSON.parse(localStorage.getItem(COLLEGE_EVENTS_KEY)) || [];
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (!currentUser) { alert("User not found."); return false; }
    if (eventIndex === -1) { alert("Event not found."); return false; }
    
    const event = events[eventIndex];

    if (event.ticketsAvailable <= 0) {
        alert(`Sorry, tickets for ${event.name} are sold out.`);
        return false;
    }
    if (currentUser.balance < event.price) {
        alert(`Insufficient balance to buy ticket for ${event.name}. Required: ${event.price} CC, Available: ${currentUser.balance} CC.`);
        return false;
    }

    // "Smart Contract" Logic:
    // 1. Deduct from user
    updateUserBalance(currentUser.username, currentUser.balance - event.price);
    // 2. Credit to event organizer (e.g., admin or a designated account)
    const adminUser = (JSON.parse(localStorage.getItem(USERS_KEY)) || []).find(u => u.username === ADMIN_USERNAME);
    if (adminUser) {
        updateUserBalance(ADMIN_USERNAME, adminUser.balance + event.price);
    }
    // 3. Decrement available tickets
    events[eventIndex].ticketsAvailable -= 1;
    localStorage.setItem(COLLEGE_EVENTS_KEY, JSON.stringify(events));
    // 4. Record transaction
    addTransaction(currentUser.username, ADMIN_USERNAME, event.price, "Event Ticket", { eventName: event.name, eventId: event.id });
    // 5. Record purchase for user
    let purchases = JSON.parse(localStorage.getItem(USER_PURCHASES_KEY)) || {};
    if (!purchases[currentUser.username]) purchases[currentUser.username] = { fees: [], events: [] };
    purchases[currentUser.username].events.push({ eventId: event.id, eventName: event.name, price: event.price, date: new Date().toISOString() });
    localStorage.setItem(USER_PURCHASES_KEY, JSON.stringify(purchases));

    alert(`Ticket for ${event.name} purchased successfully!`);
    return true;
}