/**
 * QuickSearch Web Component
 * A simple search component for product search
 */
class QuickSearch extends HTMLElement {
  constructor() {
    super();
    this.render();
    this.setupListeners();
  }

  render() {
    this.innerHTML = `
      <div class="quick-search">
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search products..."
            aria-label="Search products"
          >
          <button class="search-button" aria-label="Search">
            Search
          </button>
        </div>
        
        <div class="search-results">
          <p class="results-explanation"></p>
          <div class="results-container"></div>
        </div>
      </div>
      
      <style>
        .quick-search {
          margin-bottom: 2rem;
        }
        .search-container {
          display: flex;
          margin-bottom: 1rem;
        }
        .search-input {
          flex: 1;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px 0 0 4px;
        }
        .search-button {
          padding: 0.5rem 1rem;
          background-color: #4285f4;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
        }
        .search-button:hover {
          background-color: #3367d6;
        }
        .results-explanation {
          font-style: italic;
          margin-bottom: 1rem;
        }
        .results-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .product-card {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .product-card h3 {
          margin-top: 0;
        }
        .product-price {
          font-weight: bold;
          color: #4285f4;
        }
      </style>
    `;
  }

  setupListeners() {
    const input = this.querySelector('.search-input');
    const button = this.querySelector('.search-button');
    
    // Search on button click
    button.addEventListener('click', () => {
      this.search(input.value);
    });
    
    // Search on Enter key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.search(input.value);
      }
    });
  }

  async search(query) {
    if (!query.trim()) return;
    
    const explanationEl = this.querySelector('.results-explanation');
    const resultsEl = this.querySelector('.results-container');
    
    // Show loading state
    explanationEl.textContent = 'Searching...';
    resultsEl.innerHTML = '';
    
    try {
      // Call our search API
      const response = await fetch('/api/quick-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      // Display results
      explanationEl.textContent = data.explanation;
      
      if (data.products.length === 0) {
        resultsEl.innerHTML = '<p>No products found.</p>';
        return;
      }
      
      // Create product cards
      resultsEl.innerHTML = data.products.map(product => `
        <div class="product-card">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="product-price">$${product.price.toFixed(2)}</p>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Search error:', error);
      explanationEl.textContent = `Error: ${error.message || 'Unknown error'}`;
    }
  }
}

// Register the custom element
customElements.define('quick-search', QuickSearch);