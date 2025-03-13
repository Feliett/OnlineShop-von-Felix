// 📌 API-URL für Backend (Cloudflare Tunnel)
const API_BASE_URL = "https://vbulletin-ant-avon-portland.trycloudflare.com/api";
export default API_BASE_URL;

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
