// ---------------------------------------------------------------
// Sarees — product catalog & order flow
// ---------------------------------------------------------------

const PRODUCTS = [
  {
    id: "rani-pink-soft-silk-jacquard",
    name: "Rani Pink Soft Silk Jacquard Saree",
    material: "Soft Silk Jacquard with Silver Zari",
    uses: "Wedding wear, festive wear, party wear",
    price: 1850,
    mrp: 2499,
    image: "https://github.com/kalai-sarees184-afk/sareeimage/blob/main/sarrreee.webp?raw=true"
  }
];

// ---------------------------------------------------------------
// Google Form integration
// ---------------------------------------------------------------
// This POSTs directly to Google's formResponse endpoint using fetch().
// mode: "no-cors" is required because Google Forms doesn't send CORS
// headers back — this means we can't read the response, but the
// submission itself still goes through and lands in your Sheet.
// This approach needs NO hidden <form> or hidden <input> elements
// in index.html, which removes the most common source of silent
// failures (mismatched entry IDs, missing target iframe, etc).

const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf-KGhlj2Zq-M78UriFjGfOokgQU-NcK2xOvf2TEx1ub4MnUA/formResponse";

const GOOGLE_FORM_ENTRY_IDS = {
  name: "entry.1359770570",
  phone: "entry.179541687",
  address: "entry.1214063077",
  product: "entry.288159311",
  price: "entry.2144230775",
  payment: "entry.275138210"
};

async function submitOrderToGoogleForm(order) {
  const formData = new URLSearchParams();
  formData.append(GOOGLE_FORM_ENTRY_IDS.name, order.name);
  formData.append(GOOGLE_FORM_ENTRY_IDS.phone, order.phone);
  formData.append(GOOGLE_FORM_ENTRY_IDS.address, order.address);
  formData.append(GOOGLE_FORM_ENTRY_IDS.product, order.product);
  formData.append(GOOGLE_FORM_ENTRY_IDS.price, String(order.price));
  formData.append(GOOGLE_FORM_ENTRY_IDS.payment, order.paymentMode);

  try {
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors", // Google Forms does not return CORS headers
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });
    // With mode: "no-cors" the response is always "opaque" — we can't
    // inspect status/body. If fetch() didn't throw, the request was sent.
    console.log("Order sent to Google Form (fetch).");
    return true;
  } catch (err) {
    // Genuine network failure, or fetch blocked by a browser
    // extension/CSP. Fall back to the hidden iframe form as a
    // second attempt so the order still has a chance to go through.
    console.error("fetch() submission failed, trying hidden form fallback:", err);
    return submitViaHiddenForm(order);
  }
}

function submitViaHiddenForm(order) {
  const form = document.getElementById("googleForm");
  if (!form) {
    console.error("Hidden fallback form not found in the page.");
    return false;
  }
  try {
    document.getElementById("g-name").value = order.name;
    document.getElementById("g-phone").value = order.phone;
    document.getElementById("g-address").value = order.address;
    document.getElementById("g-product").value = order.product;
    document.getElementById("g-price").value = String(order.price);
    document.getElementById("g-payment").value = order.paymentMode;
    form.submit();
    console.log("Order sent to Google Form (hidden form fallback).");
    return true;
  } catch (err) {
    console.error("Hidden form fallback also failed:", err);
    return false;
  }
}

// ---------- Image Zoom ----------
function zoomImage(event, img) {
  const rect = img.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;
  img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
  img.style.transform = "scale(2)";
}

function hideZoom(img) {
  img.style.transform = "scale(1)";
  img.style.transformOrigin = "center";
}

let currentProduct = null;

// ---------- Render product grid ----------
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <div class="card-tier"></div>
      <div class="card-swatch">
       <img src="${p.image}"
     alt="${p.name}"
     loading="lazy"
     onmousemove="zoomImage(event,this)"
     onmouseleave="hideZoom(this)"
     onerror="this.onerror=null;this.src='images/placeholder-saree.jpg';">
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <span class="card-material">${p.material}</span>
        <p class="card-uses">${p.uses}</p>
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
    const el = document.getElementById(id);
    if (el) el.textContent = "";
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

async function handleOrderSubmit(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const name = document.getElementById("cust-name").value;
  const phone = document.getElementById("cust-phone").value;
  const address = document.getElementById("cust-address").value;
  const accepted = document.getElementById("accept-policy").checked;

  if (!validateForm(name, phone, address, accepted)) return;

  const order = {
    product: currentProduct.name,
    price: currentProduct.price,
    name: name.trim(),
    phone: phone.trim(),
    address: address.trim(),
    paymentMode: "Cash on Delivery",
    orderedAt: new Date().toISOString()
  };

  // Disable the button while we send the order so the user can't
  // double-submit while the request is in flight.
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Placing order...";
  }

  await submitOrderToGoogleForm(order);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm Order";
  }

  document.getElementById("order-form").hidden = true;
  document.getElementById("modal-success").hidden = false;
  document.getElementById("success-summary").textContent =
    `${order.product} for ${order.name}, ₹${order.price} payable by cash on delivery at: ${order.address}.`;
}

// ---------- Mobile menu ----------
function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("topnav");
  const backdrop = document.getElementById("nav-backdrop");
  if (!toggle || !nav || !backdrop) return;

  function closeMenu() {
    toggle.classList.remove("open");
    nav.classList.remove("open");
    backdrop.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  function openMenu() {
    toggle.classList.add("open");
    nav.classList.add("open");
    backdrop.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });
  backdrop.addEventListener("click", closeMenu);
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  initMobileMenu();

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
