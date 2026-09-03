export const siteConfig = {
  name: "RankeandoUp",
  domain: "rankeandoup.com",
  description: "La plataforma de subastas publicitarias en tiempo real. Compite por el puesto número #1 y destaca tu negocio ante miles de usuarios.",
  currency: "ARS",
  currencySymbol: "$",
  minBidStep: 100, // Salto mínimo para superar una puja en ARS
  baseMinBid: 500, // Puja mínima inicial si la grilla está vacía
  contactEmail: "soporte@rankeandoup.com",
  adminSecretKey: process.env.ADMIN_SECRET_KEY ?? "",
  bankDetails: {
    alias: "gblanco.25",
    cbu: "1430001713016048770018",
    accountNumber: "1301604877001",
    bank: "Brubank",
    whatsappNumber: "5491123456789", // Reemplazar con tu número de WhatsApp con código de país sin +
  },
  platforms: {
    instagram: {
      label: "Instagram",
      icon: "instagram",
      color: "from-pink-500 to-purple-600",
    },
    x: {
      label: "X (Twitter)",
      icon: "twitter",
      color: "bg-black",
    },
    youtube: {
      label: "YouTube",
      icon: "youtube",
      color: "bg-red-600",
    },
    web: {
      label: "Sitio Web",
      icon: "globe",
      color: "bg-blue-600",
    },
  },
};
