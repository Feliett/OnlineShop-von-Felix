const API_BASE_URL = "https://extra-peer-rich-demonstrate.trycloudflare.com/api";

async function checkout() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartItems.length === 0) {
        alert("Dein Warenkorb ist leer!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/checkout/create-checkout-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItems }),
        });

        const { id } = await response.json();
        window.location.href = `https://checkout.stripe.com/pay/${id}`;
    } catch (error) {
        console.error("Fehler beim Bezahlvorgang:", error);
        alert("Die Zahlung konnte nicht gestartet werden.");
    }
}
