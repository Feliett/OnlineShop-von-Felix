let alleProdukte = [];
let warenkorb = [];
let currentCategory = "Alle";

// Lagerbestand laden oder initialisieren
let lagerBestand = JSON.parse(localStorage.getItem("lagerBestand")) || {};

// Beim Laden der Seite: Produkte und Warenkorb laden, Event-Listener setzen
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

// Produkte aus JSON-Datei laden
function fetchProdukte() {
  fetch("produkte.json")
    .then(response => response.json())
    .then(data => {
      alleProdukte = data;

      // Falls noch kein Lagerbestand gespeichert ist, initialisiere ihn
      if (Object.keys(lagerBestand).length === 0) {
        alleProdukte.forEach(prod => {
          if (prod.sizeStock) {
            lagerBestand[prod.id] = prod.sizeStock;  // Größenbasierter Bestand
          } else {
            lagerBestand[prod.id] = prod.stock;  // Standardbestand
          }
        });
        saveLagerBestand();
      }

      applyFilters();
    })
    .catch(error => console.error("Fehler beim Laden der Produkte:", error));
}

// Speichert den Lagerbestand in LocalStorage
function saveLagerBestand() {
  localStorage.setItem("lagerBestand", JSON.stringify(lagerBestand));
}

// Kategorie setzen & Filter anwenden
function setCategory(kategorie) {
  currentCategory = kategorie;
  applyFilters();
}

// Wendet Filter an und zeigt nur passende Produkte
function applyFilters() {
  let filtered = alleProdukte;

  if (currentCategory !== "Alle") {
    filtered = filtered.filter(prod => prod.category === currentCategory);
  }

  renderProdukte(filtered);
}

// Rendert die Produkte im Shop
function renderProdukte(produkte) {
  const container = document.getElementById("produkt-liste");
  container.innerHTML = "";
  produkte.forEach(produkt => {
    const lagerText = lagerBestand[produkt.id] > 0 ? `📦 Lager: ${lagerBestand[produkt.id]}` : "❌ Ausverkauft";
    const produktElement = document.createElement("div");
    produktElement.classList.add("produkt");
    produktElement.innerHTML = `
      <img src="${produkt.image}" alt="${produkt.name}">
      <h3>${produkt.name}</h3>
      <p>${produkt.price.toFixed(2)} €</p>
      <p class="lagerbestand">${lagerText}</p>
    `;
    produktElement.addEventListener("click", () => openModal(produkt));
    container.appendChild(produktElement);
  });
}

// Öffnet das Modal für Produktdetails mit Lagerbestand
function openModal(produkt) {
  const modal = document.getElementById("modal");
  const modalDetails = document.getElementById("modal-product-details");

  let sizeOptions = "";
  if (produkt.sizeStock) {
    sizeOptions = Object.keys(produkt.sizeStock).map(size => 
      `<option value="${size}" ${lagerBestand[produkt.id][size] === 0 ? "disabled" : ""}>
        ${size} (${lagerBestand[produkt.id][size]} auf Lager)
      </option>`
    ).join("");
  }

  modalDetails.innerHTML = `
    <img src="${produkt.image}" alt="${produkt.name}" style="width:100%; height:auto; object-fit:cover;">
    <h3>${produkt.name}</h3>
    <p>${produkt.description || "Keine Beschreibung verfügbar."}</p>
    <p>${produkt.price.toFixed(2)} €</p>
    ${sizeOptions ? `<select id="selected-size">${sizeOptions}</select>` : ""}
    <button id="add-to-cart">In den Warenkorb</button>
  `;

  document.getElementById("add-to-cart").onclick = () => {
    const size = document.getElementById("selected-size") ? document.getElementById("selected-size").value : "";
    addToCart(produkt, size);
  };

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Produkt in den Warenkorb legen
function addToCart(produkt, size) {
  if (produkt.sizeStock && !size) {
    alert("Bitte wählen Sie eine Größe aus.");
    return;
  }

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

  warenkorb.push({ ...produkt, size, quantity: 1 });
  saveLagerBestand();
  saveWarenkorbToLocalStorage();
  closeModal();
}

// Warenkorb speichern
function saveWarenkorbToLocalStorage() {
  localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
}

// Warenkorb öffnen und rendern
function openCartModal() {
  renderCartProducts();
  document.getElementById("cart-modal").style.display = "block";
}

function closeCartModal() {
  document.getElementById("cart-modal").style.display = "none";
}

// Produkte im Warenkorb anzeigen
function renderCartProducts() {
  const cartList = document.getElementById("cart-product-list");
  cartList.innerHTML = "";

  if (warenkorb.length === 0) {
    cartList.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
    return;
  }

  warenkorb.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span>${item.name} ${item.size ? "(" + item.size + ")" : ""}</span>
      <span>${item.price.toFixed(2)} €</span>
      <button onclick="removeFromCart(${index})">Entfernen</button>
    `;
    cartList.appendChild(div);
  });
}

// Produkt aus Warenkorb entfernen (und Lagerbestand aktualisieren)
function removeFromCart(index) {
  const item = warenkorb[index];

  if (item.sizeStock) {
    lagerBestand[item.id][item.size] += 1;
  } else {
    lagerBestand[item.id] += 1;
  }

  warenkorb.splice(index, 1);
  saveLagerBestand();
  saveWarenkorbToLocalStorage();
  renderCartProducts();
}
