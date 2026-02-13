export type VentaProduct = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Venta = {
  _id: string;
  products: VentaProduct[];
  totalAmount: number;
  date: string;
};

export type VentaInput = {
  products: VentaProduct[];
  totalAmount: number;
  date?: string;
};

export type VentaFormValues = {
  productId: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  date: string;
};
