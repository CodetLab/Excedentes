import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "@/services/apiTypes";
import type { Costo, CostoFormValues, CostoInput } from "../types";
import {
  getCostos,
  createCosto as createCostoService,
  updateCosto as updateCostoService,
  deleteCosto as deleteCostoService,
} from "../services/costosService";

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as ApiError).message || "Error inesperado";
  }
  return "Error inesperado";
};

const toPayload = (values: CostoFormValues): CostoInput => ({
  nombre: values.nombre.trim(),
  etiqueta: values.etiqueta.trim(),
  monto: Number(values.monto),
  tipo: values.tipo,
});

export const useCostos = () => {
  const [items, setItems] = useState<Costo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCostos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCostos();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCostos();
  }, [loadCostos]);

  const createCosto = useCallback(async (values: CostoFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createCostoService(toPayload(values));
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateCosto = useCallback(async (id: string, values: CostoFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateCostoService(id, toPayload(values));
      setItems((prev) => prev.map((item) => (item._id === id ? updated : item)));
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteCosto = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteCostoService(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    items,
    isLoading,
    isSubmitting,
    error,
    reload: loadCostos,
    createCosto,
    updateCosto,
    deleteCosto,
  };
};
