/* ---------- Data (abridged: 3 of the 14 items shown) ---------- */
const foodItems = [
  { id: 1,  name: "Margherita Pizza", category: "Pizza",   price: 249, emoji: "\uD83C\uDF55", bg: "#ffe3e3",
    desc: "Classic cheese pizza with fresh basil and tomato sauce." },
  { id: 3,  name: "Chicken Burger",   category: "Burgers", price: 179, emoji: "\uD83C\uDF54", bg: "#fff3bf",
    desc: "Juicy grilled chicken patty with lettuce and mayo." },
  { id: 5,  name: "Chicken Biryani",  category: "Biryani", price: 289, emoji: "\uD83C\uDF5B", bg: "#ffe8cc",
    desc: "Aromatic basmati rice cooked with spiced chicken." },
  /* ... 11 more items: Pizza, Burgers, Biryani, South Indian, Snacks, Desserts, Drinks ... */
];
const STORAGE_KEY = "foodieHubCart";
/* ---------- State ---------- */
let cart = [];                 // [{ id, qty }]
let selectedCategory = "All";
let searchText = "";
/* ---------- DOM references ---------- */
const foodGrid = document.getElementById("foodGrid");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const emptyMessage = document.getElementById("emptyMessage");
const checkoutSection = document.getElementById("checkoutSection");
const successSection = document.getElementById("successSection");
const summaryBody = document.getElementById("summaryBody");
const summaryTotal = document.getElementById("summaryTotal");
const orderForm = document.getElementById("orderForm");
/* ---------- Helpers ---------- */
const formatPrice = (n) => "₹" + n.toLocaleString("en-IN");
const findFood = (id) => foodItems.find((f) => f.id === id);
function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
}
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) {
      cart = saved.filter((c) => findFood(c.id) && c.qty > 0);
    }
  } catch (e) { cart = []; }
}
/* ---------- Menu rendering ---------- */
function renderCategories() {
  const cats = ["All", ...new Set(foodItems.map((f) => f.category))];
  categoryFilters.innerHTML = "";
  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (cat === selectedCategory ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      selectedCategory = cat;
      renderCategories();
      renderMenu();
    });
    categoryFilters.appendChild(btn);
  });
}
function renderMenu() {
  const term = searchText.trim().toLowerCase();
  const filtered = foodItems.filter((f) =>
    (selectedCategory === "All" || f.category === selectedCategory) &&
    f.name.toLowerCase().includes(term)
  );
  foodGrid.innerHTML = "";
  noResults.classList.toggle("hidden", filtered.length > 0);
  filtered.forEach((f) => {
    const card = document.createElement("div");
    card.className = "food-card";
    card.innerHTML = `
      <div class="food-img" style="background:${f.bg}">${f.emoji}</div>
      <div class="food-body">
        <h3>${f.name}</h3>
        <span class="category-tag">${f.category}</span>
        <p>${f.desc}</p>
        <div class="food-footer">
          <span class="price">${formatPrice(f.price)}</span>
          <button class="btn-add" data-id="${f.id}">Add +</button>
        </div>
      </div>`;
    foodGrid.appendChild(card);
  });
}

function addToCart(id) {
  const line = cart.find((c) => c.id === id);
  if (line) line.qty += 1;
  else cart.push({ id, qty: 1 });
  updateCart();
}
function changeQty(id, delta) {
  const line = cart.find((c) => c.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter((c) => c.id !== id);
  updateCart();
}
function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  updateCart();
  }
function getTotal() {
  return cart.reduce((sum, c) => sum + findFood(c.id).price * c.qty, 0);
}
function updateCart() {
  saveCart();
  cartList.innerHTML = "";
  cart.forEach((c) => {
    const f = findFood(c.id);
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div>
        <div class="name">${f.emoji} ${f.name}</div>
        <div class="unit">${formatPrice(f.price)} each</div>
      </div>
      <div class="sub">${formatPrice(f.price * c.qty)}</div>
      <div class="qty-box">
        <button class="qty-btn" data-action="dec" data-id="${f.id}">−</button>
        <span>${c.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${f.id}">+</button>
      </div>
      <button class="remove-btn" data-action="remove" data-id="${f.id}">Remove</button>`;
    cartList.appendChild(li);
  });
  emptyMessage.classList.toggle("hidden", cart.length > 0);
  cartTotal.textContent = formatPrice(getTotal());
  cartCount.textContent = cart.reduce((n, c) => n + c.qty, 0);
  if (!checkoutSection.classList.contains("hidden")) renderSummary();
}
/* ---------- Order summary ---------- */
function renderSummary() {
  summaryBody.innerHTML = "";
  cart.forEach((c) => {
    const f = findFood(c.id);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${f.name}</td><td>${c.qty}</td><td>${formatPrice(f.price)}</td><td>${formatPrice(f.price * c.qty)}</td>`;
    summaryBody.appendChild(tr);
  });
  summaryTotal.textContent = formatPrice(getTotal());
}
function showCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before placing an order.");
    return;
  }
  renderSummary();
  checkoutSection.classList.remove("hidden");
  checkoutSection.scrollIntoView({ behavior: "smooth" });
}
/* ---------- Validation ---------- */
function setError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.toggle("invalid", message !== "");
  return message === "";
}
function validateForm() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const okName = setError("custName", "nameError",
    name.length < 3 ? "Please enter your full name (min 3 characters)." :
    !/^[A-Za-z .]+$/.test(name) ? "Name can contain only letters and spaces." : "");
  const okPhone = setError("custPhone", "phoneError", !/^[6-9]\d{9}$/.test(phone) ? "Enter a valid 10-digit mobile number." : "");
    const okEmail = setError("custEmail", "emailError",
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address." : "");
  const okAddr = setError("custAddress", "addressError",
    address.length < 10 ? "Address must be at least 10 characters." : "");
  return okName && okPhone && okEmail && okAddr;
}
function submitOrder(e) {
  e.preventDefault();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  if (!validateForm()) return;
  const name = document.getElementById("custName").value.trim();
  const orderId = "FH" + Date.now().toString().slice(-6);
  document.getElementById("successText").textContent =
    `Thank you, ${name}! Your order #${orderId} of ${formatPrice(getTotal())} has been placed and will be delivered soon.`;
  cart = [];
  updateCart();
  orderForm.reset();
  checkoutSection.classList.add("hidden");
  document.querySelector(".layout").classList.add("hidden");
  successSection.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function startNewOrder() {
  successSection.classList.add("hidden");
  document.querySelector(".layout").classList.remove("hidden");
}
/* ---------- Event listeners ---------- */
foodGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add");
  if (btn) addToCart(Number(btn.dataset.id));
});
cartList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "inc") changeQty(id, 1);
  if (btn.dataset.action === "dec") changeQty(id, -1);
  if (btn.dataset.action === "remove") removeFromCart(id);
});
searchInput.addEventListener("input", (e) => {
  searchText = e.target.value;
  renderMenu();
});
document.getElementById("clearCartBtn").addEventListener("click", () => {
  cart = [];
  updateCart();
});
document.getElementById("checkoutBtn").addEventListener("click", showCheckout);
document.getElementById("backBtn").addEventListener("click", () => checkoutSection.classList.add("hidden"));
document.getElementById("newOrderBtn").addEventListener("click", startNewOrder);
orderForm.addEventListener("submit", submitOrder);
/* ---------- Init ---------- */
loadCart();
renderCategories();
renderMenu();
updateCart();

