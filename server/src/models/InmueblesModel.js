import mongoose from "mongoose"; 

const InmuebleSchema = new mongoose.Schema(
    {
        item: { type: Number, required: true, min: 0},
        Designacion: { type: String, required: true, trim: true},
        Descripcion: { type: String, required: true, trim: true},
        Identificacion: { type: String, required: true, trim: true },
        ValorNuevo: { type: Number, required: true, min: 0},
        ValorActual: { type: Number, required: true, min: 0}, 
        Afectado: { type: Number, required: true, min: 0},
        CuotaNueva: { type: Number, required: true, min: 0},
        CuotaMercado: { type: Number, required: true, min: 0}, 
    },
    { 
        timestamps: { createdAt: true, updatedAt: false } 
    }
);

export default mongoose.model("Inmueble", InmuebleSchema);