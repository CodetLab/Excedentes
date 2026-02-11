export const buildGetCostos = ({ costoRepository }) => async () => {
  return costoRepository.getAll();
};
