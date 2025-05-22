# AI Product Search Technical Implementation Plan

## Architecture Overview

We'll implement a Retrieval-Augmented Generation (RAG) approach for our AI product search, consisting of:

1. **Product Vectorization Service**: Converts product data to vector embeddings
2. **Query Processing Service**: Processes natural language queries
3. **Retrieval Engine**: Matches queries to relevant products
4. **Response Generation**: Creates natural language responses based on query and products
5. **Search API**: Backend endpoints that tie these components together
6. **Frontend Integration**: UI components for search and result display

## Technical Implementation

### 1. Data Preparation and Embeddings

```typescript
// src/services/embeddings.ts

import { createEmbedding } from './ai-service';
import type { Product } from '../types';

export interface ProductEmbedding {
  id: number;
  embedding: number[];
  product: Product;
}

export async function createProductEmbeddings(products: Product[]): Promise<ProductEmbedding[]> {
  return Promise.all(products.map(async (product) => {
    // Create rich content text combining all product attributes
    const content = `${product.name}. ${product.description}. Price: ${product.price}.`;
    
    // Generate embedding vector
    const embedding = await createEmbedding(content);
    
    return {
      id: product.id,
      embedding,
      product
    };
  }));
}
```

### 2. Vector Storage and Similarity Search

```typescript
// src/services/vector-store.ts

import { ProductEmbedding } from './embeddings';
import { cosineSimilarity } from '../utils/vector';

export class VectorStore {
  private embeddings: ProductEmbedding[] = [];

  constructor(embeddings: ProductEmbedding[] = []) {
    this.embeddings = embeddings;
  }

  addEmbeddings(embeddings: ProductEmbedding[]) {
    this.embeddings = [...this.embeddings, ...embeddings];
  }

  findSimilar(queryEmbedding: number[], limit: number = 5): ProductEmbedding[] {
    // Calculate similarity scores for all products
    const scored = this.embeddings.map(item => ({
      item,
      score: cosineSimilarity(queryEmbedding, item.embedding)
    }));
    
    // Sort by similarity score (highest first)
    const sorted = scored.sort((a, b) => b.score - a.score);
    
    // Return top matches
    return sorted.slice(0, limit).map(result => result.item);
  }
}
```

### 3. Natural Language Query Processor

```typescript
// src/services/query-processor.ts

import { createEmbedding } from './ai-service';
import { VectorStore } from './vector-store';
import type { Product } from '../types';

export async function processNaturalLanguageQuery(
  query: string,
  vectorStore: VectorStore
): Promise<{ products: Product[], reasoning: string }> {
  // Generate embedding for the query
  const queryEmbedding = await createEmbedding(query);
  
  // Find similar products using vector similarity
  const matches = vectorStore.findSimilar(queryEmbedding, 5);
  
  // Extract the actual product objects
  const products = matches.map(match => match.product);
  
  // Generate explanation for why these products were selected
  const reasoning = await generateReasoning(query, products);
  
  return { products, reasoning };
}

async function generateReasoning(query: string, products: Product[]): Promise<string> {
  // Use AI service to generate reasoning
  const productInfo = products.map(p => 
    `${p.name}: ${p.description} ($${p.price})`
  ).join('\n');
  
  const prompt = `
    User query: "${query}"
    
    Based on this query, the following products were found:
    ${productInfo}
    
    Please explain in 1-2 sentences why these products match the user's query:
  `;
  
  return await callLLM(prompt);
}
```

### 4. AI Service Integration

```typescript
// src/services/ai-service.ts

// Configuration for external AI API
const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = 'https://api.openai.com/v1/embeddings';
const LLM_API_URL = 'https://api.openai.com/v1/chat/completions';

// Function to create embeddings
export async function createEmbedding(text: string): Promise<number[]> {
  // Implementation depends on chosen AI provider (OpenAI, Anthropic, etc.)
  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text
    })
  });
  
  const data = await response.json();
  return data.data[0].embedding;
}

// Function to call LLM for reasoning generation
export async function callLLM(prompt: string): Promise<string> {
  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful product search assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

### 5. API Endpoint Implementation

```typescript
// src/routes/api.ts (extending existing file)

import { Hono } from "hono";
import { Context } from "hono";
import db from "../db/db.ts";
import { createProductEmbeddings } from "../services/embeddings";
import { VectorStore } from "../services/vector-store";
import { processNaturalLanguageQuery } from "../services/query-processor";

// Add to existing api const from Hono()

// Initialize vector store (in a real app, this would be persisted)
let vectorStore: VectorStore | null = null;

// Helper to ensure vector store is initialized
async function getVectorStore(): Promise<VectorStore> {
  if (!vectorStore) {
    const products = db.query("SELECT * FROM products").all();
    const embeddings = await createProductEmbeddings(products);
    vectorStore = new VectorStore(embeddings);
  }
  return vectorStore;
}

// AI search endpoint
api.post("/search", async (c: Context) => {
  try {
    const { query } = await c.req.json();
    
    if (!query || typeof query !== 'string') {
      return c.json({ error: "Query is required" }, 400);
    }
    
    // Get vector store
    const store = await getVectorStore();
    
    // Process query
    const searchResults = await processNaturalLanguageQuery(query, store);
    
    return c.json({
      query,
      reasoning: searchResults.reasoning,
      products: searchResults.products
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ error: "Failed to process search" }, 500);
  }
});

// Endpoint to refresh embeddings when products change
api.post("/admin/refresh-embeddings", async (c: Context) => {
  try {
    const products = db.query("SELECT * FROM products").all();
    const embeddings = await createProductEmbeddings(products);
    vectorStore = new VectorStore(embeddings);
    return c.json({ success: true, count: embeddings.length });
  } catch (error) {
    console.error("Refresh error:", error);
    return c.json({ error: "Failed to refresh embeddings" }, 500);
  }
});
```

### 6. Frontend Component (Basic Implementation)

```typescript
// src/public/js/components/AISearch.js

class AISearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.setupListeners();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .search-container {
          width: 100%;
          margin-bottom: 20px;
        }
        
        .search-input {
          width: calc(100% - 60px);
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .search-button {
          width: 50px;
          padding: 12px;
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .results-container {
          margin-top: 20px;
        }
        
        .ai-reasoning {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-style: italic;
        }
      </style>
      
      <div class="search-container">
        <input type="text" class="search-input" placeholder="Ask about our products...">
        <button class="search-button">🔍</button>
      </div>
      
      <div class="results-container"></div>
    `;
  }
  
  setupListeners() {
    const input = this.shadowRoot.querySelector('.search-input');
    const button = this.shadowRoot.querySelector('.search-button');
    const resultsContainer = this.shadowRoot.querySelector('.results-container');
    
    button.addEventListener('click', () => {
      this.performSearch(input.value);
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch(input.value);
      }
    });
  }
  
  async performSearch(query) {
    if (!query.trim()) return;
    
    const resultsContainer = this.shadowRoot.querySelector('.results-container');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      this.displayResults(data);
      
    } catch (error) {
      resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  }
  
  displayResults(data) {
    const resultsContainer = this.shadowRoot.querySelector('.results-container');
    
    // Start with AI reasoning
    let html = `
      <div class="ai-reasoning">
        ${data.reasoning}
      </div>
      <div class="products-grid">
    `;
    
    // Add product cards
    data.products.forEach(product => {
      html += `
        <div class="product-card">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="price">$${product.price.toFixed(2)}</p>
        </div>
      `;
    });
    
    html += '</div>';
    
    resultsContainer.innerHTML = html;
  }
}

customElements.define('ai-search', AISearch);
```

## Implementation Phases

### Phase 1: Foundation (1-2 weeks)
- Set up embedding generation service
- Implement basic vector similarity search
- Create API endpoint for search
- Add simple frontend search component
- Manually test with small product set

### Phase 2: Enhancement (2-3 weeks)
- Improve reasoning generation with better prompts
- Add feedback mechanisms (thumbs up/down)
- Implement caching for common queries
- Add search analytics tracking
- Optimize for mobile use

### Phase 3: Refinement (Ongoing)
- Use feedback data to improve search results
- Add personalization based on user browsing history
- Implement A/B testing for different search approaches
- Add voice input support for mobile

## Technical Considerations

### Performance
- Cache embeddings to avoid regenerating them frequently
- Consider using Web Workers for client-side vector calculations
- Implement proper indexing for larger product catalogs

### Security
- Secure API keys for AI services
- Implement rate limiting for search API
- Sanitize user input to prevent prompt injection

### Cost Management
- Monitor AI API usage and costs
- Batch embedding generation to reduce API calls
- Consider using smaller, local models for embedding generation

### Testing Strategy
- Unit tests for vector similarity functions
- Integration tests for search API endpoints
- Automated UI tests for search component
- Manual testing with diverse query types