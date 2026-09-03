import { MercadoPagoConfig, Preference } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN?.trim();

export const mpConfig = accessToken
  ? new MercadoPagoConfig({ accessToken })
  : null;

export const mpPreference = mpConfig ? new Preference(mpConfig) : null;
