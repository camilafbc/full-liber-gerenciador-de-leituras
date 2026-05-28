import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Muitas requisições vindas desse IP. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Limite de tentativas de autenticação excedido. Tente novamente dentro de 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
