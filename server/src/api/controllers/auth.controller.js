import { loginUser, registerUser } from "../../services/auth.service.js";
import logger from "../../utils/logger.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;
    const result = await registerUser({ name, email, password, companyName });
    
    // ✅ Permitir registro sin companyName (se configurará después)
    // Solo advertir en logs si no hay companyId
    if (!result.user.companyId) {
      logger.warn("AUTH", "Registration without company - user will need to complete setup", { email });
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("[AUTH-CONTROLLER] login attempt", { email: req.body.email });
    
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    
    console.log("[AUTH-CONTROLLER] login success", {
      email: result.user.email,
      companyId: result.user.companyId,
      role: result.user.role,
      tokenFirstChars: result.token.substring(0, 20)
    });

    // ✅ Permitir login sin companyId (frontend mostrará modal de configuración)
    if (!result.user.companyId) {
      logger.warn("AUTH", "Login without companyId - user needs to complete setup", {
        email,
        userId: result.user.id
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[AUTH-CONTROLLER] login error:", error.message);
    return res.status(401).json({ error: error.message });
  }
};
