export const paymentMethods = ["pix", "boleto", "cartão de crédito"] as const;

export const paymentGatewayMapper = {
  stripe: paymentMethods.filter((method) => method !== "pix"),
  "mercado-pago": paymentMethods,
  inter: paymentMethods,
} as const;
