// Unit tests for simple vector store search functionality

// Import the functions we'll be testing (these will be implemented soon)
import { createSimpleSearchIndex, simpleSearch, generateBasicExplanation } from './simple-vector-store';

describe('Simple Vector Store', () => {
  // Test data - mock products for testing
  const testProducts = [
    { id: 1, name: "Coding Mug", description: "A perfect mug for your late night coding sessions", price: 14.99, created_at: "2023-01-01" },
    { id: 2, name: "Mechanical Keyboard", description: "Tactile keys for the ultimate typing experience", price: 129.99, created_at: "2023-01-02" },
    { id: 3, name: "Ergonomic Mouse", description: "Comfortable mouse for all-day use", price: 49.99, created_at: "2023-01-03" }
  ];

  describe('createSimpleSearchIndex', () => {
    test('should create an index with searchable text for each product', () => {
      const index = createSimpleSearchIndex(testProducts);
      
      // Verify index structure
      expect(index).toHaveLength(3);
      expect(index[0].id).toBe(1);
      expect(index[0].product).toEqual(testProducts[0]);
      
      // Verify searchText is lowercase and contains product name and description
      expect(index[0].searchText).toBe("coding mug a perfect mug for your late night coding sessions");
      expect(index[1].searchText).toBe("mechanical keyboard tactile keys for the ultimate typing experience");
      expect(index[2].searchText).toBe("ergonomic mouse comfortable mouse for all-day use");
    });

    test('should handle empty product array', () => {
      const index = createSimpleSearchIndex([]);
      expect(index).toHaveLength(0);
    });
  });

  describe('simpleSearch', () => {
    // Create index once for all tests
    const index = createSimpleSearchIndex(testProducts);

    test('should find exact matches', () => {
      const results = simpleSearch(index, "ergonomic mouse");
      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe(3);
      expect(results[0].score).toBeGreaterThan(0);
    });

    test('should find partial matches', () => {
      const results = simpleSearch(index, "typing");
      expect(results).toHaveLength(1);
      expect(results[0].product.id).toBe(2); // Mechanical Keyboard
    });

    test('should return multiple matches in score order', () => {
      // "for" appears in multiple products
      const results = simpleSearch(index, "for");
      expect(results.length).toBeGreaterThan(1);
      // Results should be sorted by score (highest first)
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    });

    test('should return empty array for no matches', () => {
      const results = simpleSearch(index, "nonexistent product");
      expect(results).toHaveLength(0);
    });

    test('should handle empty query', () => {
      const results = simpleSearch(index, "");
      expect(results).toHaveLength(0);
    });
  });

  describe('generateBasicExplanation', () => {
    test('should explain when no products are found', () => {
      const explanation = generateBasicExplanation("headphones", []);
      expect(explanation).toBe('No products found matching "headphones".');
    });

    test('should explain when one product is found', () => {
      const results = [
        { product: testProducts[2], score: 1.0 }
      ];
      const explanation = generateBasicExplanation("ergonomic", results);
      expect(explanation).toBe('Found 1 product matching "ergonomic": Ergonomic Mouse.');
    });

    test('should explain when multiple products are found', () => {
      const results = [
        { product: testProducts[0], score: 1.0 },
        { product: testProducts[1], score: 0.5 }
      ];
      const explanation = generateBasicExplanation("typing", results);
      expect(explanation).toBe('Found 2 products matching "typing", including Coding Mug.');
    });
  });
});