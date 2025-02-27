let alleProdukte = [];
let warenkorb = [];
let currentCategory = "Alle";

// Lagerbestand wird aus localStorage geladen oder initialisiert
let lagerBestand = JSON.parse(localStorage.getItem("lagerBestand")) || {};

// Beim Laden der Seite: Produkte, Warenkorb und Event-Listener setzen
document.addEventListener("DOMContentLoaded", () => {
  fetchProdukte();
  loadWarenkorbFromLocalStorage();

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("cart-close").addEventListener("click", closeCartModal);
  document.getElementById("continue-shopping").addEventListener("click", closeCartModal);
  document.getElementById("checkout").addEventListener("click", () => {
    alert("Checkout-Funktionalität ist noch nicht implementiert.");
  });
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("modal");
    const cartModal = document.getElementById("cart-modal");
    if (event.target === modal) closeModal();
    if (event.target === cartModal) closeCartModal();
  });
});

// Produkte aus der JSON-Datei laden
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
      // Initialisiere den Lagerbestand, falls noch nicht vorhanden
      if (Object.keys(lagerBestand).length === 0) {
        alleProdukte.forEach(prod => {
          if (prod.sizeStock) {
            lagerBestand[prod.id] = prod.sizeStock;
          } else {
            lagerBestand[prod.id] = prod.stock;
          }
        });
        saveLagerBestand();
      }
      applyFilters();
    })
    .catch(error => console.error("Fehler beim Laden der Produkte:", error));
}

function saveLagerBestand() {
  localStorage.setItem("lagerBestand", JSON.stringify(lagerBestand));
}

// Setzt die aktuelle Kategorie und zeigt entsprechende Größenfilter an/aus
function setCategory(kategorie) {
  currentCategory = kategorie;
  if (kategorie === "Bekleidung") {
    document.getElementById("clothing-size-filter").style.display = "inline-block";
  } else {
    document.getElementById("clothing-size-filter").style.display = "none";
  }
  if (kategorie === "Schuhe") {
    document.getElementById("shoe-size-filter").style.display = "inline-block";
  } else {
    document.getElementById("shoe-size-filter").style.display = "none";
  }
  applyFilters();
}

// Wendet alle Filter an: Kategorie, Geschlecht, Preis, und Größenfilter
function applyFilters() {
  let filtered = alleProdukte;
  if (currentCategory !== "Alle") {
    filtered = filtered.filter(prod => prod.category === currentCategory);
  }
  const genderFilter = document.getElementById("gender-filter").value;
  if (genderFilter !== "Alle") {
    filtered = filtered.filter(prod => prod.gender === genderFilter);
  }
  const priceFilter = document.getElementById("price-filter").value;
  if (priceFilter !== "Alle") {
    const [min, max] = priceFilter.split("-").map(Number);
    filtered = filtered.filter(prod => prod.price >= min && prod.price <= max);
  }
  const clothingSizeFilter = document.getElementById("clothing-size-filter").value;
  if (clothingSizeFilter !== "Alle" && currentCategory === "Bekleidung") {
    filtered = filtered.filter(prod => prod.sizeStock && prod.sizeStock.hasOwnProperty(clothingSizeFilter));
  }
  const shoeSizeFilter = document.getElementById("shoe-size-filter").value;
  if (shoeSizeFilter !== "Alle" && currentCategory === "Schuhe") {
    filtered = filtered.filter(prod => prod.sizeStock && prod.sizeStock.hasOwnProperty(shoeSizeFilter));
  }
  renderProdukte(filtered);
}

// Rendert die Produktliste
function renderProdukte(produkte) {
  const container = document.getElementById("produkt-liste");
  container.innerHTML = "";
  produkte.forEach(produkt => {
    const lagerText = (lagerBestand[produkt.id] && typeof lagerBestand[produkt.id] === "object")
      ? `Auf Lager: ${Object.values(lagerBestand[produkt.id]).reduce((a,b) => a+b, 0)}`
      : `Auf Lager: ${lagerBestand[produkt.id]}`;
    const produktElement = document.createElement("div");
    produktElement.classList.add("produkt");
    produktElement.innerHTML = `
      <img src="${produkt.image}" alt="${produkt.name}">
      <h3>${produkt.name}</h3>
      <p>${produkt.price.toFixed(2)} € ${produkt.oldPrice ? `<span class="old-price">${produkt.oldPrice.toFixed(2)} €</span>` : ""}</p>
      <p class="lagerbestand">${lagerText}</p>
    `;
    produktElement.addEventListener("click", () => openModal(produkt));
    container.appendChild(produktElement);
  });
}

// Öffnet das Modal für Produktdetails inkl. Größenwahl
function openModal(produkt) {
  const modal = document.getElementById("modal");
  const modalDetails = document.getElementById("modal-product-details");
  modalDetails.innerHTML = `
    <img src="${produkt.image}" alt="${produkt.name}" style="width:100%; height:auto; object-fit:cover; border-radius:8px;">
    <h3>${produkt.name}</h3>
    <p>${produkt.description || "Keine detaillierte Beschreibung verfügbar."}</p>
    <p class="price">${produkt.price.toFixed(2)} € ${produkt.oldPrice ? `<span class="old-price">${produkt.oldPrice.toFixed(2)} €</span>` : ""}</p>
  `;
  const sizeSelection = document.getElementById("size-selection");
  if (produkt.sizeStock) {
    let options = "<option value=\"\">Größe wählen</option>";
    for (const size in produkt.sizeStock) {
      const stockForSize = lagerBestand[produkt.id] ? lagerBestand[produkt.id][size] : 0;
      options += `<option value="${size}" ${stockForSize === 0 ? "disabled" : ""}>${size} (${stockForSize} auf Lager)</option>`;
    }
    sizeSelection.innerHTML = `<select id="selected-size">${options}</select>`;
  } else {
    sizeSelection.innerHTML = "";
  }
  document.getElementById("add-to-cart").onclick = () => {
    const size = document.getElementById("selected-size") ? document.getElementById("selected-size").value : "";
    if (produkt.sizeStock && !size) {
      alert("Bitte wählen Sie eine Größe aus.");
      return;
    }
    addToCart(produkt, size);
  };
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Warenkorb-Funktionen

function addToCart(produkt, size) {
  if (produkt.sizeStock) {
    if (lagerBestand[produkt.id][size] <= 0) {
      alert("Diese Größe ist leider ausverkauft.");
      return;
    }
    lagerBestand[produkt.id][size] -= 1;
  } else {
    if (lagerBestand[produkt.id] <= 0) {
      alert("Dieses Produkt ist leider ausverkauft.");
      return;
    }
    lagerBestand[produkt.id] -= 1;
  }
  const index = warenkorb.findIndex(item => item.id === produkt.id && item.size === size);
  if (index !== -1) {
    warenkorb[index].quantity += 1;
  } else {
    warenkorb.push({ ...produkt, quantity: 1, size: size });
  }
  saveLagerBestand();
  saveWarenkorbToLocalStorage();
  alert(`${produkt.name} ${size ? "(" + size + ")" : ""} wurde dem Warenkorb hinzugefügt!`);
  closeModal();
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
      <img src="${item.image}" alt="${item.name}" class="cart-image">
      <div class="cart-info">
        <p class="cart-product-name">${item.name}</p>
        ${item.size ? `<p class="cart-product-size">Größe: ${item.size}</p>` : ""}\n
      </div>
      <span class="cart-price">${item.price.toFixed(2)} €</span>
      <div class="quantity-controls">
        <button onclick="decreaseQuantity('${item.id}', '${item.size}')">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity('${item.id}', '${item.size}')">+</button>
      </div>
      <button onclick="removeFromCart('${item.id}', '${item.size}')" class="remove-btn">Entfernen</button>
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
  document.getElementById("cart-total").innerHTML = "Gesamtsumme: " + total.toFixed(2) + " €";
}

function increaseQuantity(productId, size) {
  const index = warenkorb.findIndex(item => item.id === productId && item.size === size);
  if (index !== -1) {
    if (alleProdukte.find(prod => prod.id === productId).sizeStock) {
      if (lagerBestand[productId][size] <= 0) {
        alert("Keine weitere Menge verfügbar.");
        return;
      }
      lagerBestand[productId][size] -= 1;
    } else {
      if (lagerBestand[productId] <= 0) {
        alert("Keine weitere Menge verfügbar.");
        return;
      }
      lagerBestand[productId] -= 1;
    }
    warenkorb[index].quantity += 1;
    saveLagerBestand();
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}

function decreaseQuantity(productId, size) {
  const index = warenkorb.findIndex(item => item.id === productId && item.size === size);
  if (index !== -1) {
    if (warenkorb[index].quantity > 1) {
      warenkorb[index].quantity -= 1;
      if (alleProdukte.find(prod => prod.id === productId).sizeStock) {
        lagerBestand[productId][size] += 1;
      } else {
        lagerBestand[productId] += 1;
      }
    } else {
      removeFromCart(productId, size);
      return;
    }
    saveLagerBestand();
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}

function removeFromCart(productId, size) {
  const index = warenkorb.findIndex(item => item.id === productId && item.size === size);
  if (index !== -1) {
    if (alleProdukte.find(prod => prod.id === productId).sizeStock) {
      lagerBestand[productId][size] += warenkorb[index].quantity;
    } else {
      lagerBestand[productId] += warenkorb[index].quantity;
    }
    warenkorb.splice(index, 1);
    saveLagerBestand();
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}
