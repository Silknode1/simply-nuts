export type Product = {
  id: string;
  title: string;
  price: number;
  category: 'retail' | 'corporate';
};

export type CartLineInput = {
  productId: string;
  quantity: number;
};
