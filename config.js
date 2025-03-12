// 📌 API-URL für Backend (Cloudflare Tunnel)
const API_BASE_URL = "https://extra-peer-rich-demonstrate.trycloudflare.com/api";

// 📌 Stripe Checkout URL
const STRIPE_CHECKOUT_URL = "https://checkout.stripe.com/pay/";

// 📌 Funktion zum Abrufen der API-URL
function getApiBaseUrl() {
    return API_BASE_URL;
}

// 📌 Funktion zum Abrufen der Stripe-URL
function getStripeCheckoutUrl() {
    return STRIPE_CHECKOUT_URL;
}

// 📌 Export für andere Dateien im Frontend
export { getApiBaseUrl, getStripeCheckoutUrl };
