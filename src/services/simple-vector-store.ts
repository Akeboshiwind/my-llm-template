// Simple search functionality that doesn't require vector embeddings

// Define interfaces for our types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
}

export interface SearchIndexItem {
  id: number;
  searchText: string;
  product: Product;
}

export interface SearchResult {
  product: Product;
  score: number;
}

/**
 * Creates a simple search index from product data
 * This is a lightweight alternative to vector embeddings
 */
export function createSimpleSearchIndex(products: Product[]): SearchIndexItem[] {
  return products.map(product => ({
    id: product.id,
    searchText: `${product.name} ${product.description}`.toLowerCase(),
    product
  }));
}

/**
 * Simple search function that matches terms in the query
 * against product name and description
 */
export function simpleSearch(searchIndex: SearchIndexItem[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }
  
  const searchTerms = query.toLowerCase().split(' ');
  
  // Calculate a simple relevance score based on term frequency
  return searchIndex
    .map(item => {
      const score = searchTerms.reduce((total, term) => {
        return total + (item.searchText.includes(term) ? 1 : 0);
      }, 0) / searchTerms.length;
      
      return { product: item.product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Generates a simple explanation of the search results
 */
export function generateBasicExplanation(query: string, results: SearchResult[]): string {
  if (results.length === 0) {
    return `No products found matching "${query}".`;
  }
  
  const topProduct = results[0].product;
  const count = results.length;
  
  if (count === 1) {
    return `Found 1 product matching "${query}": ${topProduct.name}.`;
  } else {
    return `Found ${count} products matching "${query}", including ${topProduct.name}.`;
  }
}