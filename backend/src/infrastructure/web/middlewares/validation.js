export const validateRequest = (rules = {}) => (req, res, next) => {
  const required = rules.required || [];
  const missing = required.filter((field) => req.body?.[field] === undefined);

  if (missing.length > 0) {
    return res.status(400).json({
      message: "Datos invalidos",
      missing,
    });
  }

  return next();
};
