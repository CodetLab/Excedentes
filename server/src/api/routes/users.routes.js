import { Router } from "express";
import { setupCompany, getCompanyInfo } from "../controllers/users.controller.js";

const router = Router();

// Setup company for user (requires auth)
// POST /api/users/setup-company
router.post("/setup-company", setupCompany);

// Get company info (works both as /api/users/company and /api/company via alias)
// GET /api/users/company or GET /api/company
router.get("/company", getCompanyInfo);
router.get("/", getCompanyInfo); // For /api/company route

export default router;
