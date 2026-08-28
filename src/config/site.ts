export const siteConfig = {
  name: "rankinguponline",
  domain: "rankinguponline.com",
  description: "La plataforma de subastas publicitarias en tiempo real. Compite por el puesto número #1 y destaca tu negocio ante miles de usuarios.",
  currency: "ARS",
  currencySymbol: "$",
  minBidStep: 100, // Salto mínimo para superar una puja en ARS
  baseMinBid: 500, // Puja mínima inicial si la grilla está vacía
  contactEmail: "soporte@rankinguponline.com",
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
