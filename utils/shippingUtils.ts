/**
 * Utility to calculate shipping cost based on PIN code distance.
 * Range: ₹60 to ₹120
 */
export const calculateShipping = (userZip: string | undefined): number => {
    if (!userZip) return 60; // Default base price if no zip is provided yet

    // Assume Seller is in Delhi (110001)
    const SELLER_PREFIX = 11;
    const userPrefix = parseInt(userZip.substring(0, 2)) || 11;

    // Calculate difference (0 to ~80)
    const diff = Math.abs(userPrefix - SELLER_PREFIX);

    /**
     * Logic:
     * Base: ₹60
     * Variable: ₹0 - ₹60 added based on prefix distance
     * Max difference in India is roughly 80 (e.g., 11 vs 91)
     */
    const variableFee = Math.min(60, diff * 1.5);
    const totalFee = 60 + variableFee;

    return Math.round(totalFee);
};
