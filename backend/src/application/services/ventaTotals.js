export const calculateTotalAmount = (products) => {
  return products.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.unitPrice),
    0
  );
};
