let alleProdukte = [];
let warenkorb = [];
let currentCategory = "Alle";

// Beim Laden der Seite: Produkte und Warenkorb laden, Event-Listener setzen
document.addEventListener("DOMContentLoaded", () => {
  fetchProdukte();
  loadWarenkorbFromLocalStorage();

  // Modal-Schließen für Produktdetails
  document.getElementById("modal-close").addEventListener("click", closeModal);
  // Modal-Schließen für Warenkorb
  document.getElementById("cart-close").addEventListener("click", closeCartModal);
  document.getElementById("continue-shopping").addEventListener("click", closeCartModal);
  document.getElementById("checkout").addEventListener("click", () => {
    alert("Checkout-Funktionalität ist noch nicht implementiert.");
  });
  // Schließen, wenn außerhalb des Modals geklickt wird
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
      applyFilters();
    })
    .catch(error => console.error("Fehler beim Laden der Produkte:", error));
}

// Setzt die aktuelle Kategorie und wendet Filter an
function setCategory(kategorie) {
  currentCategory = kategorie;
  // Je nach Kategorie, zeige bzw. verstecke die Größenfilter
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

// Wendet alle Filter an: Kategorie, Geschlecht, Preis, Größe (Bekleidung/Schuhe)
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
  // Preisfilter
  const priceFilter = document.getElementById("price-filter").value;
  if (priceFilter !== "Alle") {
    const [min, max] = priceFilter.split("-").map(Number);
    filtered = filtered.filter(prod => prod.price >= min && prod.price <= max);
  }
  // Bekleidung-Größenfilter (nur wenn Kategorie Bekleidung)
  const clothingSizeFilter = document.getElementById("clothing-size-filter").value;
  if (clothingSizeFilter !== "Alle" && currentCategory === "Bekleidung") {
    filtered = filtered.filter(prod => prod.size && prod.size.includes(clothingSizeFilter));
  }
  // Schuhgrößenfilter (nur wenn Kategorie Schuhe)
  const shoeSizeFilter = document.getElementById("shoe-size-filter").value;
  if (shoeSizeFilter !== "Alle" && currentCategory === "Schuhe") {
    filtered = filtered.filter(prod => prod.shoeSize && prod.shoeSize.toString() === shoeSizeFilter);
  }
  renderProdukte(filtered);
}

// Rendert die Produktliste im Container
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
    // Öffne Modal mit Produktdetails beim Klick
    produktElement.addEventListener("click", () => openModal(produkt));
    container.appendChild(produktElement);
  });
}

// Öffnet das Modal für Produktdetails und ermöglicht Größenwahl, falls vorhanden
function openModal(produkt) {
  const modal = document.getElementById("modal");
  const modalDetails = document.getElementById("modal-product-details");
  modalDetails.innerHTML = `
    <img src="${produkt.image}" alt="${produkt.name}" style="width:100%; height:auto; object-fit:cover; border-radius:8px;">
    <h3>${produkt.name}</h3>
    <p>${produkt.description || "Keine detaillierte Beschreibung verfügbar."}</p>
    <p class="price">${produkt.price.toFixed(2)} € ${produkt.oldPrice ? `<span class="old-price">${produkt.oldPrice.toFixed(2)} €</span>` : ""}</p>
  `;
  // Falls das Produkt Größen hat, zeige eine Dropdown-Auswahl
  const sizeSelection = document.getElementById("size-selection");
  if (produkt.size || produkt.shoeSize) {
    let options = "<option value=\"\">Größe wählen</option>";
    if (produkt.size) {
      produkt.size.forEach(sz => {
        options += `<option value="${sz}">${sz}</option>`;
      });
    } else if (produkt.shoeSize) {
      // Bei Schuhen: Erlaubt nur eine Größe (das Produkt hat eine feste Größe, die aber auch zur Anzeige kommt)
      options += `<option value="${produkt.shoeSize}">${produkt.shoeSize}</option>`;
    }
    sizeSelection.innerHTML = `<select id="selected-size">${options}</select>`;
  } else {
    sizeSelection.innerHTML = "";
  }
  // "In den Warenkorb"-Button
  document.getElementById("add-to-cart").onclick = () => {
    const size = document.getElementById("selected-size") ? document.getElementById("selected-size").value : "";
    if ((produkt.size || produkt.shoeSize) && !size) {
      alert("Bitte wählen Sie eine Größe aus.");
      return;
    }
    addToCart(produkt, size);
  };
  modal.style.display = "block";
}

// Schließt das Produktdetail-Modal
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Warenkorb-Funktionen:

// Fügt ein Produkt dem Warenkorb hinzu oder erhöht die Menge, falls es bereits existiert (unterscheidet nach Größe)
function addToCart(produkt, size) {
  const index = warenkorb.findIndex(item => item.id === produkt.id && item.size === size);
  if (index !== -1) {
    warenkorb[index].quantity += 1;
  } else {
    warenkorb.push({ ...produkt, quantity: 1, size: size });
  }
  saveWarenkorbToLocalStorage();
  alert(`${produkt.name} (${size}) wurde dem Warenkorb hinzugefügt!`);
  closeModal();
}

// Lädt den Warenkorb aus LocalStorage
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

// Speichert den Warenkorb in LocalStorage
function saveWarenkorbToLocalStorage() {
  localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
}

// Öffnet das Warenkorb-Modal und rendert die enthaltenen Produkte
function openCartModal() {
  renderCartProducts();
  document.getElementById("cart-modal").style.display = "block";
}

// Schließt das Warenkorb-Modal
function closeCartModal() {
  document.getElementById("cart-modal").style.display = "none";
}

// Rendert die Produkte im Warenkorb, inkl. Plus/Minus-Steuerung und Anzeige der Gesamtsumme
function renderCartProducts() {
  const cartList = document.getElementById("cart-product-list");
  cartList.innerHTML = "";
  if (warenkorb.length === 0) {
    cartList.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
    updateCartTotal();
    return;
  }
  warenkorb.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cart-product");
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span>${item.name} ${item.size ? "(" + item.size + ")" : ""}</span>
      <span>${item.price.toFixed(2)} €</span>
      <div class="quantity-controls">
        <button onclick="decreaseQuantity(${item.id}, '${item.size}')">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity(${item.id}, '${item.size}')">+</button>
      </div>
      <button onclick="removeFromCart(${item.id}, '${item.size}')">Entfernen</button>
    `;
    cartList.appendChild(div);
  });
  updateCartTotal();
}

// Berechnet und aktualisiert die Gesamtsumme im Warenkorb
function updateCartTotal() {
  let total = 0;
  warenkorb.forEach(item => {
    total += item.price * item.quantity;
  });
  document.getElementById("cart-total").innerHTML = "Gesamtsumme: " + total.toFixed(2) + " €";
}

// Erhöht die Menge eines Produkts im Warenkorb
function increaseQuantity(productId, size) {
  const index = warenkorb.findIndex(item => item.id === productId && item.size === size);
  if (index !== -1) {
    warenkorb[index].quantity += 1;
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}

// Verringert die Menge eines Produkts oder entfernt es, wenn die Menge 1 erreicht
function decreaseQuantity(productId, size) {
  const index = warenkorb.findIndex(item => item.id === productId && item.size === size);
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

// Entfernt ein Produkt komplett aus dem Warenkorb
function removeFromCart(productId, size) {
  const index = warenkorb.findIndex(item => item.id === productId && item.size === size);
  if (index !== -1) {
    warenkorb.splice(index, 1);
    saveWarenkorbToLocalStorage();
    renderCartProducts();
  }
}
