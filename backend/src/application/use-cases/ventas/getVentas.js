export const buildGetVentas = ({ ventaRepository }) => async () => {
  return ventaRepository.getAll();
};
