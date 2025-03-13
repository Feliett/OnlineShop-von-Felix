document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    updateCartCount();

    // 🏠 LOGO-KLICK -> Zur Startseite
    document.querySelector(".logo").addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // 🛒 Warenkorb öffnen
    document.getElementById("cart-icon").addEventListener("click", showCart);
});

// ✅ PRODUKTE LADEN
function loadProducts() {
    fetch("https://vbulletin-ant-avon-portland.trycloudflare.com/api/products")
        .then(response => response.json())
        .then(products => {
            let html = "";
            products.forEach(product => {
                html += `
                    <div class="product">
                        <img src="${product.image}" data-id="${product._id}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.price} €</p>
                        <button class="add-to-cart" data-id="${product._id}">In den Warenkorb</button>
                    </div>
                `;
            });
            document.getElementById("product-container").innerHTML = html;

            // Klick auf Produktbilder für Details
            document.querySelectorAll(".product img").forEach(img => {
                img.addEventListener("click", (event) => {
                    openProductModal(event.target.dataset.id);
                });
            });

            // Klick auf "In den Warenkorb"
            document.querySelectorAll(".add-to-cart").forEach(btn => {
                btn.addEventListener("click", (event) => {
                    addToCart(event.target.dataset.id);
                });
            });
        });
}

// ✅ PRODUKTDETAILS ANZEIGEN
function openProductModal(productId) {
    fetch(`https://vbulletin-ant-avon-portland.trycloudflare.com/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById("productModalTitle").innerText = product.name;
            document.getElementById("productModalImage").src = product.image;
            document.getElementById("productModalDescription").innerText = product.description;
            document.getElementById("addToCart").dataset.id = productId;
            document.getElementById("productModal").style.display = "block";
        });
}

// ✅ PRODUKTE IN WARENKORB LEGEN
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(p => p.id === productId);
    if (item) {
        item.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert("Produkt wurde in den Warenkorb gelegt!");
}

// ✅ WARENKORB ANZEIGEN
function showCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let html = "";
    cart.forEach(product => {
        html += `<p>Produkt ID: ${product.id} - Anzahl: ${product.quantity}</p>`;
    });
    document.getElementById("cart-items").innerHTML = html;
    document.getElementById("cartModal").style.display = "block";
}

// 🛍 WARENKORB AKTUALISIEREN
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.getElementById("cart-count").innerText = cart.length;
}

// ✅ MODAL SCHLIESSEN
function closeCart() { document.getElementById("cartModal").style.display = "none"; }
function closeProductModal() { document.getElementById("productModal").style.display = "none"; }
