// Cart management using localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => {
        el.textContent = `(${count})`;
    });
}

function addToCart(bookName, price) {
    const cart = getCart();
    const existing = cart.find(item => item.name === bookName);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name: bookName, price: parseFloat(price), quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
    showNotification(`"${bookName}" added to cart!`);
}

function showNotification(message) {
    let notif = document.getElementById('cart-notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'cart-notification';
        notif.style.cssText = `
            position: fixed; bottom: 30px; right: 30px;
            background: #c9a84c; color: #0a0e1a;
            padding: 14px 24px; border-radius: 6px;
            font-weight: bold; z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            transition: opacity 0.4s;
        `;
        document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.style.opacity = '1';
    clearTimeout(notif._timeout);
    notif._timeout = setTimeout(() => { notif.style.opacity = '0'; }, 2500);
}

// Attach Add to Cart buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const bookName = btn.getAttribute('data-book');
        const price = btn.getAttribute('data-price');
        addToCart(bookName, price);
    });
});

// ---- CART PAGE ----
function renderCart() {
    const cartEmpty = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');
    const cartItemsList = document.getElementById('cart-items-list');
    if (!cartEmpty || !cartContent || !cartItemsList) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }

    cartEmpty.style.display = 'none';
    cartContent.style.display = 'flex';

    cartItemsList.innerHTML = '';
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style.cssText = `
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 0; border-bottom: 1px solid rgba(201,168,76,0.2);
            gap: 12px;
        `;
        div.innerHTML = `
            <div style="flex:1;">
                <p style="font-weight:bold; margin:0 0 6px;">${item.name}</p>
                <p style="margin:0; opacity:0.7;">$${item.price.toFixed(2)} each</p>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <button onclick="changeQty(${index}, -1)" style="width:28px;height:28px;background:#c9a84c;border:none;border-radius:4px;cursor:pointer;font-size:16px;font-weight:bold;color:#0a0e1a;">−</button>
                <span style="min-width:20px;text-align:center;">${item.quantity}</span>
                <button onclick="changeQty(${index}, 1)" style="width:28px;height:28px;background:#c9a84c;border:none;border-radius:4px;cursor:pointer;font-size:16px;font-weight:bold;color:#0a0e1a;">+</button>
            </div>
            <div style="min-width:80px;text-align:right;">
                <p style="margin:0;font-weight:bold;">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button onclick="removeItem(${index})" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:18px;" title="Remove">✕</button>
        `;
        cartItemsList.appendChild(div);
    });

    updateSummary(cart);
}

function changeQty(index, delta) {
    const cart = getCart();
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
    renderCart();
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
    renderCart();
}

function updateSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 5.99;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('cart-subtotal', `$${subtotal.toFixed(2)}`);
    set('cart-shipping', `$${shipping.toFixed(2)}`);
    set('cart-tax', `$${tax.toFixed(2)}`);
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerHTML = `<strong>$${total.toFixed(2)}</strong>`;
    const checkoutTotal = document.getElementById('checkout-total');
    if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
}

// Checkout button
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        document.getElementById('cart-content').style.display = 'none';
        document.getElementById('checkout-form').style.display = 'block';
        updateSummary(getCart());
    });
}

// Back to cart
const backBtn = document.getElementById('back-to-cart');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        document.getElementById('checkout-form').style.display = 'none';
        renderCart();
    });
}

// Place order
const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCart([]);
        updateCartCount();
        document.getElementById('checkout-form').innerHTML = `
            <div style="text-align:center; padding: 60px 20px;">
                <h2 style="color:#c9a84c;">✓ Order Placed!</h2>
                <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
                <a href="books.html" class="btn btn-primary" style="margin-top:20px; display:inline-block;">Continue Shopping</a>
            </div>
        `;
    });
}

// Init
updateCartCount();
renderCart();
