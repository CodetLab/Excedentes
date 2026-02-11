export type CostoTipo = "FIJO" | "VARIABLE";

export type Costo = {
  _id: string;
  nombre: string;
  etiqueta: string;
  monto: number;
  tipo: CostoTipo;
};

export type CostoInput = {
  nombre: string;
  etiqueta: string;
  monto: number;
  tipo: CostoTipo;
};

export type CostoFormValues = {
  nombre: string;
  etiqueta: string;
  monto: string;
  tipo: CostoTipo;
};
