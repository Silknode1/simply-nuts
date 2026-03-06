import type {CartLineInput, Product} from '@snm/types/product';

export interface CommerceAdapter {
  getProducts(): Promise<Product[]>;
  addToCart(lines: CartLineInput[]): Promise<{checkoutUrl: string}>;
}
