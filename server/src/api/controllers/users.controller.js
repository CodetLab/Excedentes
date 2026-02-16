import { setupCompanyForUser } from "../../services/auth.service.js";
import Company from "../../models/CompanyModel.js";
import logger from "../../utils/logger.js";

/**
 * Setup company for user without companyId
 * POST /api/users/setup-company
 */
export const setupCompany = async (req, res) => {
  try {
    const { companyName } = req.body;
    const userId = req.user.sub; // From JWT

    if (!companyName) {
      return res.status(400).json({
        success: false,
        error: "Company name is required"
      });
    }

    logger.info("USERS", "Setting up company for user", { userId, companyName });

    const company = await setupCompanyForUser(userId, companyName);

    return res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    logger.error("USERS", "Error setting up company", { error: error.message });
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get company info for current user
 * GET /api/company
 */
export const getCompanyInfo = async (req, res) => {
  try {
    const companyId = req.user.companyId; // From JWT

    if (!companyId) {
      return res.status(404).json({
        success: false,
        error: "User has no company assigned"
      });
    }

    const company = await Company.findById(companyId).lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: company._id.toString(),
        name: company.name,
        cuit: company.cuit,
        industry: company.industry,
        currency: company.currency,
        createdAt: company.createdAt
      }
    });
  } catch (error) {
    logger.error("USERS", "Error fetching company info", { error: error.message });
    return res.status(500).json({
      success: false,
      error: "Failed to fetch company information"
    });
  }
};
