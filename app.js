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
},
   
  {
    id: "linen-emerald-gold",
    name: "Linen Zari Border Saree",
    material: "Linen with Zari Border",
    uses: "Office wear, festive wear",
    price: 1450,
    mrp: 1900,
    image: "images/linen-emerald-gold.jpg"
  },
  {
    id: "floral-lavender",
    name: "Soft Cotton Floral Print",
    material: "Soft Cotton",
    uses: "Daily wear, casual outings",
    price: 950,
    mrp: 1300,
    image: "images/floral-lavender.jpg"
  },
  {
    id: "blue-temple-zari",
    name: "Temple Border Silk-Cotton",
    material: "Silk-Cotton with Temple Border",
    uses: "Festive wear, temple visits",
    price: 1750,
    mrp: 2300,
    image: "images/blue-temple-zari.jpg"
  },
  {
    id: "maroon-pattu",
    name: "Festive Pattu Saree",
    material: "Pure Pattu Silk",
    uses: "Weddings, special occasions",
    price: 2200,
    mrp: 2900,
    image: "images/maroon-pattu.jpg"
  },
  {
    id: "checked-pink-rose",
    name: "Checked Cotton with Rose Print",
    material: "Cotton",
    uses: "Daily wear, casual wear",
    price: 850,
    mrp: 1100,
    image: "images/checked-pink-rose.jpg"
  }
];
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

async function handleOrderSubmit(e) {
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
  // Fill the hidden Google Form
document.getElementById("g-name").value = order.name;
document.getElementById("g-phone").value = order.phone;
document.getElementById("g-address").value = order.address;
document.getElementById("g-product").value = order.product;
document.getElementById("g-price").value = order.price;
document.getElementById("g-payment").value = order.paymentMode;

console.log(document.getElementById("g-name").value);
console.log(document.getElementById("g-phone").value);
console.log(document.getElementById("g-address").value);
console.log(document.getElementById("g-product").value);
console.log(document.getElementById("g-price").value);
console.log(document.getElementById("g-payment").value);
  // Submit the hidden Google Form
document.getElementById("googleForm").submit();
  console.log("Google Form Submitted");


  document.getElementById("order-form").hidden = true;
  document.getElementById("modal-success").hidden = false;
  document.getElementById("success-summary").textContent =
    `${order.product} for ${order.name}, ₹${order.price} payable by cash on delivery at: ${order.address}.`;
}

// Stores the order in the browser so the shop owner can review it later
// (placeholder for a real backend / WhatsApp / Google Sheet integration)

   

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
