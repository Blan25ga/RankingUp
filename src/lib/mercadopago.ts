import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializar el cliente de Mercado Pago con el token de acceso
// En desarrollo, usamos un token de prueba si no está definido
const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "APP_USR-mock-token",
});

export const mpPreference = new Preference(mpConfig);
