export const buildGetProductos = ({ productoRepository }) => async () => {
  return productoRepository.getAll();
};
