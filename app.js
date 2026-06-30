// ---------------------------------------------------------------
// Kalai Sarees — product catalog & order flow
// ---------------------------------------------------------------

const PRODUCTS = [
  {
    id: "sungudi-pink-mustard",
    name: "Sungudi Tie-Dye Saree",
    tag: "Pure Cotton · Sungudi",
    price: 800,
    mrp: 1100,
    colors: ["#D94A7A", "#E8B23D", "#F7EDE0"]
  },
  {
    id: "linen-emerald-gold",
    name: "Linen Zari Border Saree",
    tag: "Linen · Zari Border",
    price: 1450,
    mrp: 1900,
    colors: ["#1F6B4A", "#C8923A", "#FBE9C7"]
  },
  {
    id: "floral-lavender",
    name: "Soft Cotton Floral Print",
    tag: "Cotton · Daily Wear",
    price: 950,
    mrp: 1300,
    colors: ["#E7E0F2", "#D94A7A", "#6B1326"]
  },
  {
    id: "blue-temple-zari",
    name: "Temple Border Silk-Cotton",
    tag: "Silk-Cotton · Temple Border",
    price: 1750,
    mrp: 2300,
    colors: ["#1B3A6B", "#C8923A", "#F7EDE0"]
  },
  {
    id: "maroon-pattu",
    name: "Festive Pattu Saree",
    tag: "Pattu · Wedding Wear",
    price: 2200,
    mrp: 2900,
    colors: ["#6B1326", "#E8B23D", "#241010"]
  },
  {
    id: "checked-pink-rose",
    name: "Checked Cotton with Rose Print",
    tag: "Cotton · Casual",
    price: 850,
    mrp: 1100,
    colors: ["#F2D6DA", "#D94A7A", "#fff"]
  }
];

let currentProduct = null;

// ---------- Render product grid ----------
function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <div class="card-tier"></div>
      <div class="card-swatch" style="background:linear-gradient(165deg, ${p.colors[0]} 0%, ${p.colors[0]} 55%, ${p.colors[1]} 55%, ${p.colors[1]} 80%, ${p.colors[2]} 80%);">
        <div class="pallu" style="background:repeating-linear-gradient(45deg, ${p.colors[1]} 0 8px, ${p.colors[0]} 8px 16px);"></div>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <span class="card-tag">${p.tag}</span>
        <p class="card-price">₹${p.price} <span>₹${p.mrp}</span></p>
        <button class="btn-order" data-id="${p.id}">Order Now</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".btn-order").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.id));
  });
}

// ---------- Modal control ----------
function openModal(productId) {
  currentProduct = PRODUCTS.find(p => p.id === productId);
  if (!currentProduct) return;

  document.getElementById("modal-title").textContent = currentProduct.name;
  document.getElementById("modal-price").textContent = `₹${currentProduct.price} · Cash on Delivery`;

  document.getElementById("order-form").hidden = false;
  document.getElementById("modal-success").hidden = true;
  document.getElementById("order-form").reset();
  clearErrors();

  document.getElementById("modal-backdrop").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.remove("open");
  document.body.style.overflow = "";
}

function clearErrors() {
  ["err-name", "err-phone", "err-address"].forEach(id => {
    document.getElementById(id).textContent = "";
  });
}

// ---------- Form validation & submit ----------
function validateForm(name, phone, address, accepted) {
  let valid = true;
  clearErrors();

  if (!name.trim() || name.trim().length < 3) {
    document.getElementById("err-name").textContent = "Please enter your full name.";
    valid = false;
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length !== 10) {
    document.getElementById("err-phone").textContent = "Enter a valid 10-digit phone number.";
    valid = false;
  }
  if (!address.trim() || address.trim().length < 10) {
    document.getElementById("err-address").textContent = "Please enter your full delivery address.";
    valid = false;
  }
  if (!accepted) {
    valid = false;
  }
  return valid;
}

function handleOrderSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("cust-name").value;
  const phone = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const accepted = document.getElementById("accept-policy").checked;

  if (!validateForm(name, phone, address, accepted)) return;

  // Build a simple order record (in a real shop this would POST to a server)
  const order = {
    product: currentProduct.name,
    price: currentProduct.price,
    name: name.trim(),
    phone: phone.trim(),
    address: address.trim(),
    paymentMode: "Cash on Delivery",
    orderedAt: new Date().toISOString()
  };

  saveOrderLocally(order);

  document.getElementById("order-form").hidden = true;
  document.getElementById("modal-success").hidden = false;
  document.getElementById("success-summary").textContent =
    `${order.product} for ${order.name}, ₹${order.price} payable by cash on delivery at: ${order.address}.`;
}

// Stores the order in the browser so the shop owner can review it later
// (placeholder for a real backend / WhatsApp / Google Sheet integration)
function saveOrderLocally(order) {
  try {
    const existing = JSON.parse(localStorage.getItem("kalai_orders") || "[]");
    existing.push(order);
    localStorage.setItem("kalai_orders", JSON.stringify(existing));
  } catch (err) {
    console.warn("Could not save order locally:", err);
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("success-close").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.getElementById("order-form").addEventListener("submit", handleOrderSubmit);
});
