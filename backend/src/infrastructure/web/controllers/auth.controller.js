import { loginUser, registerUser } from "../../../application/services/auth.service.js";

export const buildAuthController = () => ({
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await registerUser({ name, email, password });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await loginUser({ email, password });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
});
