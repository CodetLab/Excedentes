import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "@/services/apiTypes";
import type { Producto, ProductoFormValues, ProductoInput } from "../types";
import {
  getProductos,
  createProducto as createProductoService,
  updateProducto as updateProductoService,
  deleteProducto as deleteProductoService,
} from "../services/productosService";

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as ApiError).message || "Error inesperado";
  }
  return "Error inesperado";
};

const toPayload = (values: ProductoFormValues): ProductoInput => ({
  name: values.name.trim(),
  price: Number(values.price),
  cost: Number(values.cost),
  stock: Number(values.stock),
});

export const useProductos = () => {
  const [items, setItems] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProductos();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const createProducto = useCallback(async (values: ProductoFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createProductoService(toPayload(values));
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateProducto = useCallback(async (id: string, values: ProductoFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateProductoService(id, toPayload(values));
      setItems((prev) => prev.map((item) => (item._id === id ? updated : item)));
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteProducto = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteProductoService(id);
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
    reload: loadProductos,
    createProducto,
    updateProducto,
    deleteProducto,
  };
};
