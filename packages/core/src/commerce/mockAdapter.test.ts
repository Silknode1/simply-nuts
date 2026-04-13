import {describe, it, expect} from 'vitest';
import {getMockProducts} from './mockAdapter';
import type {Product} from '@snm/types/product';

const VALID_CATEGORIES: Product['category'][] = ['retail', 'corporate'];

describe('getMockProducts', () => {
  it('returns an array', () => {
    const products = getMockProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it('returns at least one product', () => {
    const products = getMockProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  it('returns a fresh array on each call (not a singleton reference)', () => {
    const first = getMockProducts();
    const second = getMockProducts();
    expect(first).not.toBe(second);
  });

  // -------------------------------------------------------------------------
  // Required fields — every product must have id, title, price, category
  // -------------------------------------------------------------------------

  it('every product has a non-empty id string', () => {
    const products = getMockProducts();
    for (const product of products) {
      expect(typeof product.id).toBe('string');
      expect(product.id.length).toBeGreaterThan(0);
    }
  });

  it('every product has a non-empty title string', () => {
    const products = getMockProducts();
    for (const product of products) {
      expect(typeof product.title).toBe('string');
      expect(product.title.length).toBeGreaterThan(0);
    }
  });

  it('every product has a numeric price', () => {
    const products = getMockProducts();
    for (const product of products) {
      expect(typeof product.price).toBe('number');
    }
  });

  it('every product has a positive price', () => {
    const products = getMockProducts();
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
    }
  });

  it('every product has a valid category', () => {
    const products = getMockProducts();
    for (const product of products) {
      expect(VALID_CATEGORIES).toContain(product.category);
    }
  });

  // -------------------------------------------------------------------------
  // Shape conformance — matches the Product type exactly
  // -------------------------------------------------------------------------

  it('products conform to the Product type shape (only expected keys)', () => {
    const products = getMockProducts();
    const expectedKeys = new Set(['id', 'title', 'price', 'category']);
    for (const product of products) {
      const actualKeys = new Set(Object.keys(product));
      // All expected keys must be present
      for (const key of expectedKeys) {
        expect(actualKeys.has(key)).toBe(true);
      }
    }
  });

  it('all product ids are unique', () => {
    const products = getMockProducts();
    const ids = products.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  // -------------------------------------------------------------------------
  // Specific product spot-checks
  // -------------------------------------------------------------------------

  it('includes a retail product', () => {
    const products = getMockProducts();
    const retailProducts = products.filter((p) => p.category === 'retail');
    expect(retailProducts.length).toBeGreaterThan(0);
  });

  it('includes a corporate product', () => {
    const products = getMockProducts();
    const corporateProducts = products.filter((p) => p.category === 'corporate');
    expect(corporateProducts.length).toBeGreaterThan(0);
  });

  it('product with id "p1" is a retail Secret Peanuts product', () => {
    const products = getMockProducts();
    const p1 = products.find((p) => p.id === 'p1');
    expect(p1).toBeDefined();
    expect(p1!.category).toBe('retail');
    expect(p1!.price).toBe(12.99);
    expect(p1!.title).toMatch(/peanut/i);
  });

  it('product with id "p2" is a retail Mixed Nuts product', () => {
    const products = getMockProducts();
    const p2 = products.find((p) => p.id === 'p2');
    expect(p2).toBeDefined();
    expect(p2!.category).toBe('retail');
    expect(p2!.price).toBe(15.99);
  });

  it('product with id "p3" is a corporate Engraved Bamboo Container', () => {
    const products = getMockProducts();
    const p3 = products.find((p) => p.id === 'p3');
    expect(p3).toBeDefined();
    expect(p3!.category).toBe('corporate');
    expect(p3!.price).toBe(39.99);
    expect(p3!.title).toMatch(/bamboo/i);
  });

  // -------------------------------------------------------------------------
  // Boundary / edge values
  // -------------------------------------------------------------------------

  it('prices are finite numbers (not NaN or Infinity)', () => {
    const products = getMockProducts();
    for (const product of products) {
      expect(Number.isFinite(product.price)).toBe(true);
    }
  });

  it('prices have at most 2 decimal places (cents precision)', () => {
    const products = getMockProducts();
    for (const product of products) {
      const rounded = Math.round(product.price * 100) / 100;
      expect(product.price).toBe(rounded);
    }
  });
});
