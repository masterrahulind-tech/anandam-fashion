"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seoProductRouter = exports.cashfreeWebhook = exports.createCashfreeOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
admin.initializeApp();
// Cashfree Production Credentials
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "1240640ae173ee6fed8f47c41240460421";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "REPLACE_WITH_YOUR_SECRET_KEY";
// Use the production endpoint
const CASHFREE_URL = "https://api.cashfree.com/pg/orders";
exports.createCashfreeOrder = functions.https.onCall(async (request) => {
    var _a;
    // Basic authentication rule placeholder - adjust to your needs
    if (!request.auth) {
        // You might want to allow guests. If so, remove context.auth check or use anonymous auth.
        // For now let's allow since Firebase might use custom auth or just pass token.
    }
    const { orderId, orderAmount, customerDetails } = request.data;
    if (!orderId || !orderAmount || !customerDetails) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required parameters: orderId, orderAmount, customerDetails");
    }
    try {
        const payload = {
            order_id: orderId,
            order_amount: orderAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: customerDetails.id || "guest",
                customer_phone: customerDetails.phone || "9999999999",
                customer_email: customerDetails.email || "guest@example.com",
                customer_name: customerDetails.name || "Guest"
            },
            order_meta: {
                // Return URL isn't strictly necessary with the drop-in checkout SDK, 
                // but passing a placeholder or site URL is good practice.
                // Replace with your actual domain when deploying.
                return_url: `https://your-firebase-project.web.app/order-confirmation/${orderId}`
            }
        };
        const response = await axios_1.default.post(CASHFREE_URL, payload, {
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
                "Content-Type": "application/json"
            }
        });
        // Cashfree returns a `payment_session_id` which the frontend needs.
        return {
            paymentSessionId: response.data.payment_session_id,
            orderId: response.data.order_id
        };
    }
    catch (error) {
        console.error("Cashfree order creation failed:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new functions.https.HttpsError("internal", "Failed to create Cashfree order. Please check server logs.");
    }
});
exports.cashfreeWebhook = functions.https.onRequest(async (req, res) => {
    // This webhook will be called by Cashfree on payment success or failure.
    // Ensure you register this webhook URL in the Cashfree dashboard.
    try {
        const body = req.body;
        // Typical structure of Cashfree Webhook Data
        const eventType = body.type;
        if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
            const orderId = body.data.order.order_id;
            // Mark the order as Paid in Firestore securely
            await admin.firestore().collection("orders").doc(orderId).update({
                paymentStatus: "Paid",
                updatedAt: new Date().toISOString()
            });
            console.log(`Order ${orderId} marked as Paid via webhook.`);
        }
        else if (eventType === "PAYMENT_FAILED_WEBHOOK") {
            const orderId = body.data.order.order_id;
            await admin.firestore().collection("orders").doc(orderId).update({
                paymentStatus: "Failed",
                updatedAt: new Date().toISOString()
            });
            console.log(`Order ${orderId} marked as Failed via webhook.`);
        }
        res.status(200).send("OK");
    }
    catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).send("Internal Server Error");
    }
});
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.seoProductRouter = functions.https.onRequest(async (req, res) => {
    try {
        const pathParts = req.path.split('/');
        // Assuming path is like /product/xxxx123 -> ['', 'product', 'xxxx123']
        const productId = pathParts[2];
        let title = 'Anandam Fashion | Exquisite Women & Kids Boutique';
        let description = 'Discover Anandam Fashion\'s exquisite collection of artisanal Indian ethnic wear for women and children. Handcrafted heritage, timeless elegance, and sustainable luxury.';
        let imageUrl = 'https://anandame-com.web.app/logo.png';
        const url = `https://anandame-com.web.app${req.path}`;
        if (productId) {
            try {
                const docSnap = await admin.firestore().collection('products').doc(productId).get();
                if (docSnap.exists) {
                    const product = docSnap.data();
                    if (product) {
                        title = `${product.name} | Anandam Atelier`;
                        description = product.description || description;
                        if (product.images && product.images.length > 0) {
                            imageUrl = product.images[0];
                        }
                    }
                }
            }
            catch (err) {
                console.error("Error fetching product for SEO:", err);
            }
        }
        // Read the actual index.html that was copied during build
        const indexPath = path.resolve(__dirname, 'index.html');
        let indexHtml = '';
        if (fs.existsSync(indexPath)) {
            indexHtml = fs.readFileSync(indexPath, 'utf-8');
        }
        else {
            // Fallback just in case
            indexHtml = `<!DOCTYPE html><html><head></head><body></body></html>`;
        }
        // Replace Generic Meta Tags with Dynamically hydrated ones
        indexHtml = indexHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        // Handle potentially existing description
        if (indexHtml.includes('name="description"')) {
            indexHtml = indexHtml.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description.substring(0, 160)}">`);
        }
        else {
            indexHtml = indexHtml.replace('</head>', `<meta name="description" content="${description.substring(0, 160)}">\n</head>`);
        }
        const openGraphTags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description.substring(0, 160)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="product" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description.substring(0, 160)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    `;
        indexHtml = indexHtml.replace('</head>', `${openGraphTags}\n</head>`);
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.status(200).send(indexHtml);
    }
    catch (error) {
        console.error("seoProductRouter Error:", error);
        res.status(500).send("Error rendering page");
    }
});
//# sourceMappingURL=index.js.map