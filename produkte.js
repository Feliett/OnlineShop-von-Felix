let alleProdukte = [];
let warenkorb = [];
let currentCategory = "Alle";

// Beim Laden der Seite: Produkte und Warenkorb laden und Event-Listener setzen
document.addEventListener("DOMContentLoaded", () => {
  fetchProdukte();
  loadWarenkorbFromLocalStorage();

  // Modal für Produktdetails
  document.getElementById("modal-close").addEventListener("click", closeModal);
  // Modal für Warenkorb
  document.getElementById("cart-close").addEventListener("click", closeCartModal);
  document.getElementById("continue-shopping").addEventListener("click", closeCartModal);
  document.getElementById("checkout").addEventListener("click", () => {
    alert("Checkout-Funktionalität ist noch nicht implementiert.");
  });
  window.addEventListener("click", (event) => {
    const cartModal = document.getElementById("cart-modal");
    if (event.target === cartModal) {
      closeCartModal();
    }
  });
});

// Ruft die Produkte aus der JSON-Datei ab
function fetchProdukte() {
  fetch("produkte.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP-Fehler: " + response.status);
      }
      return response.json();
    })
    .then(data => {
      alleProdukte = data;
      applyFilters();
    })
    .catch(error => console.error("Fehler beim Laden der Produkte:", error));
}

// Setzt die aktuelle Kategorie und wendet die Filter an
function setCategory(kategorie) {
  currentCategory = kategorie;
  applyFilters();
}

// Wendet alle Filter (Kategorie, Gender, Bekleidung-Größe, Schuhgröße) an
function applyFilters() {
  let filtered = alleProdukte;

  // Kategorie-Filter
  if (currentCategory !== "Alle") {
    filtered = filtered.filter(prod => prod.category === currentCategory);
  }
  // Geschlechterfilter
  const genderFilter = document.getElementById("gender-filter").value;
  if (genderFilter !== "Alle") {
    filtered = filtered.filter(prod => prod.gender === genderFilter);
  }
  // Bekleidung-Größenfilter (nur für Kategorie "Bekleidung")
  const clothingSizeFilter = document.getElementById("clothing-size-filter").value;
  if (clothingSizeFilter !== "Alle" && currentCategory === "Bekleidung") {
    filtered = filtered.filter(prod => prod.size && prod.size.includes(clothingSizeFilter));
  }
  // Schuhgrößenfilter (nur für Kategorie "Schuhe")
  const shoeSizeFilter = document.getElementById("shoe-size-filter").value;
  if (shoeSizeFilter !== "Alle" && currentCategory === "Schuhe") {
    filtered = filtered.filter(prod => prod.shoeSize && prod.shoeSize.toString() === shoeSizeFilter);
  }
  renderProdukte(filtered);
}

// Rendert die Produkte in den Container
function renderProdukte(produkte) {
  const container = document.getElementById("produkt-liste");
  container.innerHTML = "";
  produkte.forEach(produkt => {
    const produktElement = document.createElement("div");
    produktElement.classList.add("produkt");
    produktElement.innerHTML = `
      <img src="${produkt.image}" alt="${produkt.name}">
      <h3>${produkt.name}</h3>
      <p>${produkt.price.toFixed(2)} € ${produkt.oldPrice ? `<span class="old-price">${produkt.oldPrice.toFixed(2)} €</span>` : ""}</p>
    `;
    produktElement.addEventListener("click", () => openModal(produkt));
    container.appendChild(produktElement);
  });
}

// Öffnet das Modal für Produktdetails
function openModal(produkt) {
  const modal = document.getElementById("modal");
  const modalDetails = document.getElementById("modal-product-details");
  modalDetails.innerHTML = `
    <img src="${produkt.image}" alt="${produkt.name}" style="width:100%; height:auto; object-fit:cover; border-radius:8px;">
    <h3>${produkt.name}</h3>
    <p>${produkt.description || "Keine detaillierte Beschreibung verfügbar."}</p>
    <p class="price">${produkt.price.toFixed(2)} € ${produkt.oldPrice ? `<span class="old-price">${produkt.oldPrice.toFixed(2)} €</span>` : ""}</p>
  `;
  document.getElementById("add-to-cart").onclick = () => {
    addToCart(produkt);
  };
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Warenkorb-Funktionen
function addToCart(produkt) {
  const index = warenkorb.findIndex(item => item.id === produkt.id);
  if (index !== -1) {
    warenkorb[index].quantity += 1;
  } else {
    warenkorb.push({ ...produkt, quantity: 1 });
  }
  saveWarenkorbToLocalStorage();
  alert(`${produkt.name} wurde dem Warenkorb hinzugefügt!`);
}

function loadWarenkorbFromLocalStorage() {
  const storedCart = localStorage.getItem("warenkorb");
  if (storedCart) {
    try {
      warenkorb = JSON.parse(storedCart);
    } catch (e) {
      warenkorb = [];
    }
  }
}

function saveWarenkorbToLocalStorage() {
  localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
}

function openCartModal() {
  renderCartProducts();
  document.getElementById("cart-modal").style.display = "block";
}

function closeCartModal() {
  document.getElementById("cart-modal").style.display = "none";
}

function renderCartProducts() {
  const cartList = document.getElementById("cart-product-list");
  cartList.innerHTML = "";
  if (warenkorb.length === 0) {
    cartList.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
    updateCartTotal();
    return;
  }
  warenkorb.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-product");
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span>${item.name}</span>
      <span>${item.price.toFixed(2)} €</span>
      <div class="quantity-controls">
        <button onclick="decreaseQuantity(${item.id})">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity(${item.id})">+</button>
      </div>
      <button onclick="removeFromCart(${item.id})">Entfernen</button>
    `;
    cartList.appendChild(div);
  });
  updateCartTotal();
}

function updateCartTotal() {
  let total = 0;
  warenkorb.forEach(item => {
    total += item.price * item.quantity;
  });
  const totalDiv = document.getElementById("cart-total");
  totalDiv.innerHTML = "Gesamtsumme: " + total.toFixed(2) + " €";
}

function increaseQuantity(productId) {
  const index = warenkorb.findIndex(item => item.id === productId);
  if (index !== -1) {
    warenkorb[index].quantity += 1;
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}

function decreaseQuantity(productId) {
  const index = warenkorb.findIndex(item => item.id === productId);
  if (index !== -1) {
    if (warenkorb[index].quantity > 1) {
      warenkorb[index].quantity -= 1;
    } else {
      warenkorb.splice(index, 1);
    }
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}

function removeFromCart(productId) {
  const index = warenkorb.findIndex(item => item.id === productId);
  if (index !== -1) {
    warenkorb.splice(index, 1);
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}
