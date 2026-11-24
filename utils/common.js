import {PAISA_PER_RUPEE} from "../constants/constants.js"

export const toPaisa = (rupees) => Math.round(Number(rupees) * PAISA_PER_RUPEE);

export const fromPaisa = (paisa) => paisa / PAISA_PER_RUPEE;

export const toRupees = (paisa) => fromPaisa(paisa).toFixed(2);