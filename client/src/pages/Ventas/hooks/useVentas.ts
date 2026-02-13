import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "@/services/apiTypes";
import type { Venta, VentaFormValues, VentaInput } from "../types";
import {
  getVentas,
  createVenta as createVentaService,
  updateVenta as updateVentaService,
  deleteVenta as deleteVentaService,
} from "../services/ventasService";

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as ApiError).message || "Error inesperado";
  }
  return "Error inesperado";
};

const toPayload = (values: VentaFormValues): VentaInput => ({
  products: [
    {
      productId: values.productId.trim(),
      quantity: Number(values.quantity),
      unitPrice: Number(values.unitPrice),
    },
  ],
  totalAmount: Number(values.totalAmount),
  date: values.date ? new Date(values.date).toISOString() : undefined,
});

export const useVentas = () => {
  const [items, setItems] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVentas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVentas();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVentas();
  }, [loadVentas]);

  const createVenta = useCallback(async (values: VentaFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createVentaService(toPayload(values));
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateVenta = useCallback(async (id: string, values: VentaFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateVentaService(id, toPayload(values));
      setItems((prev) => prev.map((item) => (item._id === id ? updated : item)));
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteVenta = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteVentaService(id);
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
    reload: loadVentas,
    createVenta,
    updateVenta,
    deleteVenta,
  };
};
