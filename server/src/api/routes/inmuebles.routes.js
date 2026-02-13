import express from "express"; 
import {
    getInmuebles,
    createInmuebles,
    updateInmuebles,
    deleteInmuebles
} from "../controllers/inmuebles.controller.js"; 

const router = express.Router();

router.get("/", getInmuebles); 
router.post("/", createInmuebles);
router.put("/:id", updateInmuebles);
router.delete("/:id", deleteInmuebles);

export default router; 
