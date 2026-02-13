export type Producto = {
  _id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  createdAt?: string;
};

export type ProductoInput = {
  name: string;
  price: number;
  cost: number;
  stock: number;
};

export type ProductoFormValues = {
  name: string;
  price: string;
  cost: string;
  stock: string;
};
