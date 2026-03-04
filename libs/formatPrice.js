/**
 * Format a price with the correct currency symbol and placement for the region.
 * Uses Intl.NumberFormat when available, with a manual fallback.
 *
 * @param {number} amount  – the numeric price (e.g. 50)
 * @param {string} currency – ISO 4217 code (e.g. "EUR", "SEK")
 * @returns {string} formatted price string (e.g. "€50", "50 kr")
 */
export function formatPrice(amount, currency = "USD") {
    if (amount === 0 || amount === null || amount === undefined) return "Free";

    try {
        // Use 'en' as the base locale so digit grouping stays familiar,
        // but Intl picks the correct symbol + placement for the currency.
        return new Intl.NumberFormat("en", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            // Drop trailing ".00" — show "€50" not "€50.00"
            trailingZeroDisplay: "stripIfInteger",
        }).format(amount);
    } catch {
        // Fallback for unknown currency codes or environments without Intl
        const symbols = {
            USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
            NZD: "NZ$", BRL: "R$", MXN: "MX$", JPY: "¥", INR: "₹",
            ZAR: "R", CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr",
            COP: "COL$", ARS: "AR$", CLP: "CL$",
        };
        const sym = symbols[currency] || currency;
        return `${sym}${amount}`;
    }
}
