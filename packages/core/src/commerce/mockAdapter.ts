import type {Product} from '@snm/types/product';

export function getMockProducts(): Product[] {
  return [
    {id: 'p1', title: 'Secret Peanuts (1 lb)', price: 12.99, category: 'retail'},
    {id: 'p2', title: 'Imperial Mixed Nuts (1 lb)', price: 15.99, category: 'retail'},
    {
      id: 'p3',
      title: 'Custom Engraved Bamboo Container',
      price: 39.99,
      category: 'corporate'
    }
  ];
}
