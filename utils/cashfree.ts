import { load } from '@cashfreepayments/cashfree-js';

let cashfree: any = null;

export const getCashfree = async () => {
    if (!cashfree) {
        cashfree = await load({
            mode: "production" // mode can be "sandbox" or "production"
        });
    }
    return cashfree;
};
