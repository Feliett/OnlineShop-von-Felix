document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    updateCart();
    
    document.getElementById("category-filter").addEventListener("change", loadProducts);
    document.getElementById("gender-filter").addEventListener("change", loadProducts);
    document.getElementById("cart-icon").addEventListener("click", showCart);
    document.getElementById("login-button").addEventListener("click", loginUser);
});

// ✅ PRODUKTE LADEN & FILTERN
function loadProducts() {
    fetch("https://vbulletin-ant-avon-portland.trycloudflare.com/api/products")
        .then(response => response.json())
        .then(products => {
            let category = document.getElementById("category-filter").value;
            let gender = document.getElementById("gender-filter").value;
            let html = "";
            products.forEach(product => {
                if ((category === "Alle" || product.category === category) &&
                    (gender === "Alle" || product.gender === gender)) {
                    html += `
                        <div class="product">
                            <img src="${product.image}" data-id="${product._id}" alt="${product.name}">
                            <h3>${product.name}</h3>
                            <p>${product.price} €</p>
                            <button class="add-to-cart" data-id="${product._id}" onclick="addToCart('${product._id}', '${product.name}')">In den Warenkorb</button>
                        </div>
                    `;
                }
            });
            document.getElementById("product-container").innerHTML = html;
        });
}

// ✅ PRODUKTE IN WARENKORB LEGEN
function addToCart(productId, productName, size = "M") {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(p => p.id === productId && p.size === size);
    if (item) {
        item.quantity++;
    } else {
        cart.push({ id: productId, name: productName, size: size, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

// ✅ WARENKORB ANZEIGEN & AKTUALISIEREN
function updateCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let html = "";
    let totalPrice = 0;
    let totalQuantity = 0;
    cart.forEach(product => {
        html += `
            <div class="cart-item">
                <img src="images/${product.id}.jpg" alt="${product.name}">
                <p>${product.name} (${product.size})</p>
                <button onclick="changeQuantity('${product.id}', '${product.size}', -1)">➖</button>
                ${product.quantity}
                <button onclick="changeQuantity('${product.id}', '${product.size}', 1)">➕</button>
            </div>
        `;
        totalQuantity += product.quantity;
        totalPrice += product.quantity * 19.99;
    });
    document.getElementById("cart-items").innerHTML = html;
    document.getElementById("total-quantity").innerText = totalQuantity;
    document.getElementById("total-price").innerText = totalPrice.toFixed(2);
}

// ✅ MENGE ÄNDERN
function changeQuantity(id, size, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(p => p.id === id && p.size === size);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(p => p !== item);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

// ✅ WARENKORB IN EINEM EXTRA FENSTER
function showCart() {
    document.getElementById("cartModal").style.display = "block";
    updateCart();
}

// ✅ WARENKORB SCHLIESSEN
function closeCart() {
    document.getElementById("cartModal").style.display = "none";
}

// ✅ NUTZER ANMELDEN
function loginUser() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    fetch("https://vbulletin-ant-avon-portland.trycloudflare.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            alert("Login erfolgreich!");
        } else {
            alert("Login fehlgeschlagen.");
        }
    });
}

// ✅ ZAHLUNG VIA STRIPE
function checkout() {
    fetch("https://vbulletin-ant-avon-portland.trycloudflare.com/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: JSON.parse(localStorage.getItem("cart")) })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sessionUrl) {
            window.location.href = data.sessionUrl;
        } else {
            alert("Fehler bei der Zahlung.");
        }
    });
}
