import{
    getInmuebles, 
    createInmuebles,
    updateInmuebles, 
    deleteInmuebles,
} from "../../services/inmuebles.service.js";

const handleControllerError = (res, error) => {
    const status = error.statusCode || 500;
    const payload = {
        message: error.message || "Error interno del servidor",
    };

    if (error.details){
        payload.errors = error.details;  
    }

    res.status(status).json(payload); 
};

export const getInmueblesController = async (req, res) => {
    try {
        const inmuebles = await getInmuebles();
        res.json(inmuebles);
    } catch (error) {
        handleControllerError(res, error);
    }
};

export const createInmueblesController = async (req, res) => {
    try{
        const nuevoInmueble = await createInmuebles(req.body);
        res.status(201).json(nuevoInmueble); 
    } catch (error) {
        handleControllerError(res, error);
    }
}; 

export const updateInmueblesController = async (req, res) => {
    try{
        const inmueble = await updateInmuebles(req.params.id, req.body);
        res.json(inmueble);
    } catch (error) {
        handleControllerError(res, error);
    }
}

export const deleteInmueblesController = async (req, res) => {
    try{
        const inmueble = await deleteInmuebles(req.params.id);
        res.status(204).send();
    } catch (error) {
        handleControllerError(res, error);
    }
};