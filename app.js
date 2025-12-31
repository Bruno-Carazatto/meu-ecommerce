/* =========================================================
   MiniShop - E-commerce simples (Nível Júnior)
   Tecnologias: HTML, CSS, JS, Bootstrap
   ========================================================= */

const PRODUCTS = [
  { id: 1, name: "Fone Bluetooth Wave", category: "Áudio", price: 179.90, rating: 4.6, image: "images/Fone-Bluetooth-Wave.webp" },
  { id: 2, name: "Teclado Mecânico Lite", category: "Periféricos", price: 249.90, rating: 4.7, image: "images/Teclado-Mecânico-Lite.webp" },
  { id: 3, name: "Mouse Gamer Pulse", category: "Periféricos", price: 129.90, rating: 4.5, image: "images/Mouse-Gamer-Pulse.webp" },
  { id: 4, name: "Smartwatch Fit Pro", category: "Wearables", price: 299.90, rating: 4.4, image: "images/Smartwatch-Fit-Pro.webp" },
  { id: 5, name: "Caixa de Som Boom", category: "Áudio", price: 219.90, rating: 4.3, image: "images/Caixa-de-Som-Boom.webp" },
  { id: 6, name: "Webcam HD 1080p", category: "Acessórios", price: 159.90, rating: 4.2, image: "images/Webcam-HD-1080p.webp" },
  { id: 7, name: "Carregador Turbo 30W", category: "Acessórios", price: 89.90, rating: 4.6, image: "images/Carregador-Turbo-30W.webp" },
  { id: 8, name: "Mochila Tech Urban", category: "Utilidades", price: 199.90, rating: 4.5, image: "images/Mochila-Tech-Urban.webp" },
  { id: 9, name: "Suporte Notebook Alum", category: "Utilidades", price: 119.90, rating: 4.4, image: "images/Suporte-Notebook-Alum.webp" },
  { id: 10, name: "Hub USB-C 6 em 1", category: "Acessórios", price: 169.90, rating: 4.3, image: "images/Hub-USB-C-6-em-1.webp" },
];

const STORAGE_KEY = "minishop_cart_v1";
const STORAGE_COUPON = "minishop_coupon_v1";

let cart = loadCart(); // { productId: qty }
let appliedCoupon = loadCoupon(); // string | null

// Elements
const productsGrid = document.getElementById("productsGrid");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const maxPriceRange = document.getElementById("maxPriceRange");
const maxPriceLabel = document.getElementById("maxPriceLabel");

const cartBadge = document.getElementById("cartBadge");
const cartItems = document.getElementById("cartItems");
const subtotalValue = document.getElementById("subtotalValue");
const discountValue = document.getElementById("discountValue");
const totalValue = document.getElementById("totalValue");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponHint = document.getElementById("couponHint");

const checkoutForm = document.getElementById("checkoutForm");
const checkoutTotal = document.getElementById("checkoutTotal");

const demoAddBtn = document.getElementById("demoAddBtn");
const resetBtn = document.getElementById("resetBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const scrollTopBtn = document.getElementById("scrollTopBtn");

const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

const toastEl = document.getElementById("appToast");
const toastBody = document.getElementById("toastBody");
const toast = new bootstrap.Toast(toastEl, { delay: 2200 });

init();

function init(){
  // Populate categories
  const categories = ["all", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
  categorySelect.innerHTML = categories.map(c => (
    `<option value="${escapeHtml(c)}">${c === "all" ? "Todas" : escapeHtml(c)}</option>`
  )).join("");

  // Range label
  maxPriceLabel.textContent = formatBRL(Number(maxPriceRange.value));

  // Restore coupon
  if (appliedCoupon) {
    couponInput.value = appliedCoupon;
    couponHint.innerHTML = `Cupom aplicado: <span class="fw-semibold text-success">${escapeHtml(appliedCoupon)}</span>`;
  }

  // Events
  searchInput.addEventListener("input", renderProducts);
  clearSearchBtn.addEventListener("click", () => { searchInput.value = ""; renderProducts(); });
  categorySelect.addEventListener("change", renderProducts);
  sortSelect.addEventListener("change", renderProducts);

  maxPriceRange.addEventListener("input", () => {
    maxPriceLabel.textContent = formatBRL(Number(maxPriceRange.value));
    renderProducts();
  });

  demoAddBtn.addEventListener("click", () => {
    addToCart(PRODUCTS[0].id, 1);
    showToast("Item demo adicionado ao carrinho!");
  });

  resetBtn.addEventListener("click", () => {
    cart = {};
    appliedCoupon = null;
    saveCart();
    saveCoupon();
    couponInput.value = "";
    couponHint.innerHTML = `Use <span class="fw-semibold">DEV10</span> para 10% off.`;
    renderCart();
    renderProducts();
    showToast("Carrinho resetado com sucesso.");
  });

  clearFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    categorySelect.value = "all";
    sortSelect.value = "featured";
    maxPriceRange.value = 1500;
    maxPriceLabel.textContent = formatBRL(1500);
    renderProducts();
    showToast("Filtros limpos.");
  });

  scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  applyCouponBtn.addEventListener("click", applyCoupon);

  clearCartBtn.addEventListener("click", () => {
    cart = {};
    saveCart();
    renderCart();
    showToast("Carrinho esvaziado.");
  });

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Simula pedido
    const total = calcTotals().total;
    cart = {};
    saveCart();
    renderCart();

    // fecha modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"));
    modal?.hide();

    showToast(`Pedido confirmado! Total: ${formatBRL(total)} (simulação) ✅`);
    checkoutForm.reset();
  });

  // LinkedIn tips (rápido)
  document.getElementById("openTips").addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Dica: poste vídeo curto + link do deploy + README bem feito 😄");
  });

  renderProducts();
  renderCart();
}

/* --------------------- Products --------------------- */
function renderProducts(){
  const query = (searchInput.value || "").trim().toLowerCase();
  const category = categorySelect.value;
  const maxPrice = Number(maxPriceRange.value);

  let list = PRODUCTS.filter(p => {
    const matchesQuery = !query || p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    const matchesCat = category === "all" || p.category === category;
    const matchesPrice = p.price <= maxPrice;
    return matchesQuery && matchesCat && matchesPrice;
  });

  // sort
  const sort = sortSelect.value;
  if (sort === "price-asc") list.sort((a,b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a,b) => b.price - a.price);
  else if (sort === "name-asc") list.sort((a,b) => a.name.localeCompare(b.name));
  else {
    // featured: rating desc, then price asc
    list.sort((a,b) => (b.rating - a.rating) || (a.price - b.price));
  }

  resultsCount.textContent = String(list.length);

  if (list.length === 0){
    productsGrid.innerHTML = "";
    emptyState.classList.remove("d-none");
    return;
  }
  emptyState.classList.add("d-none");

  productsGrid.innerHTML = list.map(p => productCardHTML(p)).join("");
  // bind buttons
  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      addToCart(id, 1);
      showToast("Adicionado ao carrinho!");
    });
  });
}

function productCardHTML(p){
  const qtyInCart = cart[p.id] || 0;
  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="product-card h-100">
        <div class="product-img">
        <img
            src="${escapeHtml(p.image)}"
            alt="${escapeHtml(p.name)}"
            loading="lazy"
        />
        </div>
        <div class="p-3 d-flex flex-column h-100">
          <div class="d-flex align-items-start justify-content-between gap-2">
            <div>
              <div class="fw-semibold">${escapeHtml(p.name)}</div>
              <div class="text-secondary small">${escapeHtml(p.category)}</div>
            </div>
            <span class="pill"><i class="bi bi-star-fill text-warning"></i> ${p.rating.toFixed(1)}</span>
          </div>

          <div class="mt-3 d-flex align-items-center justify-content-between">
            <div class="price fs-5">${formatBRL(p.price)}</div>
            <div class="small text-secondary">${qtyInCart > 0 ? `No carrinho: <b>${qtyInCart}</b>` : ""}</div>
          </div>

          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-primary flex-grow-1 btn-add" data-add="${p.id}">
              <i class="bi bi-plus-lg"></i> Adicionar
            </button>
            <button class="btn btn-outline-dark btn-add" data-bs-toggle="offcanvas" data-bs-target="#cartCanvas" aria-controls="cartCanvas" title="Abrir carrinho">
              <i class="bi bi-bag"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* --------------------- Cart --------------------- */
function renderCart(){
  const items = cartToItems();
  cartBadge.textContent = String(items.reduce((acc, it) => acc + it.qty, 0));

  if (items.length === 0){
    cartItems.innerHTML = `
      <div class="text-center text-secondary py-4">
        <div class="fs-1 mb-2">🛒</div>
        <div class="fw-semibold">Seu carrinho está vazio</div>
        <div class="small">Adicione um produto para começar.</div>
      </div>
    `;
    subtotalValue.textContent = formatBRL(0);
    discountValue.textContent = `- ${formatBRL(0)}`;
    totalValue.textContent = formatBRL(0);
    checkoutTotal.textContent = formatBRL(0);
    checkoutBtn.disabled = true;
    clearCartBtn.disabled = true;
    return;
  }

  cartItems.innerHTML = items.map(it => `
    <div class="cart-item">
      <div class="d-flex justify-content-between gap-2">
        <div>
          <div class="fw-semibold">${escapeHtml(it.name)}</div>
          <div class="small text-secondary">${escapeHtml(it.category)} • ${formatBRL(it.price)}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger" data-remove="${it.id}" title="Remover item">
          <i class="bi bi-trash3"></i>
        </button>
      </div>

      <div class="d-flex align-items-center justify-content-between mt-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-dark qty-btn" data-dec="${it.id}" aria-label="Diminuir">
            <i class="bi bi-dash-lg"></i>
          </button>
          <span class="fw-semibold">${it.qty}</span>
          <button class="btn btn-sm btn-outline-dark qty-btn" data-inc="${it.id}" aria-label="Aumentar">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        <div class="fw-bold">${formatBRL(it.price * it.qty)}</div>
      </div>
    </div>
  `).join("");

  // bind cart actions
  cartItems.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => {
    const id = Number(b.getAttribute("data-inc"));
    addToCart(id, 1);
  }));
  cartItems.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => {
    const id = Number(b.getAttribute("data-dec"));
    addToCart(id, -1);
  }));
  cartItems.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
    const id = Number(b.getAttribute("data-remove"));
    removeFromCart(id);
    showToast("Item removido.");
  }));

  const totals = calcTotals();
  subtotalValue.textContent = formatBRL(totals.subtotal);
  discountValue.textContent = `- ${formatBRL(totals.discount)}`;
  totalValue.textContent = formatBRL(totals.total);
  checkoutTotal.textContent = formatBRL(totals.total);

  checkoutBtn.disabled = false;
  clearCartBtn.disabled = false;

  saveCart();
}

function addToCart(productId, delta){
  const current = cart[productId] || 0;
  const next = current + delta;

  if (next <= 0){
    delete cart[productId];
  } else {
    cart[productId] = next;
  }

  renderCart();
  renderProducts();
}

function removeFromCart(productId){
  delete cart[productId];
  renderCart();
  renderProducts();
}

function cartToItems(){
  const ids = Object.keys(cart).map(Number);
  return ids.map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    return {
      id,
      qty: cart[id],
      name: p?.name || "Produto",
      category: p?.category || "Categoria",
      price: p?.price || 0
    };
  });
}

function calcTotals(){
  const items = cartToItems();
  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);

  // coupon
  let discount = 0;
  const code = (appliedCoupon || "").trim().toUpperCase();

  if (code === "DEV10"){
    discount = subtotal * 0.10;
  } else {
    discount = 0;
  }

  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}

/* --------------------- Coupon --------------------- */
function applyCoupon(){
  const code = (couponInput.value || "").trim().toUpperCase();

  if (!code){
    appliedCoupon = null;
    saveCoupon();
    couponHint.innerHTML = `Use <span class="fw-semibold">DEV10</span> para 10% off.`;
    renderCart();
    showToast("Cupom removido.");
    return;
  }

  if (code === "DEV10"){
    appliedCoupon = code;
    saveCoupon();
    couponHint.innerHTML = `Cupom aplicado: <span class="fw-semibold text-success">${escapeHtml(code)}</span>`;
    renderCart();
    showToast("Cupom aplicado! 10% OFF ✅");
  } else {
    appliedCoupon = null;
    saveCoupon();
    couponHint.innerHTML = `<span class="text-danger fw-semibold">Cupom inválido.</span> Tente <span class="fw-semibold">DEV10</span>.`;
    renderCart();
    showToast("Cupom inválido.");
  }
}

/* --------------------- Storage --------------------- */
function loadCart(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return (parsed && typeof parsed === "object") ? parsed : {};
  } catch {
    return {};
  }
}
function saveCart(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
}
function loadCoupon(){
  try{
    const raw = localStorage.getItem(STORAGE_COUPON);
    return raw ? String(raw) : null;
  } catch {
    return null;
  }
}
function saveCoupon(){
  try{
    if (appliedCoupon) localStorage.setItem(STORAGE_COUPON, appliedCoupon);
    else localStorage.removeItem(STORAGE_COUPON);
  } catch {}
}

/* --------------------- Utils --------------------- */
function formatBRL(value){
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showToast(message){
  toastBody.textContent = message;
  toast.show();
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
