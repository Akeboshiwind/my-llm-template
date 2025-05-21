// Create namespace for components
window.App = window.App || {};
window.App.Components = window.App.Components || {};

// Products Component
window.App.Components.Products = () => {
  const { useState, useEffect } = React;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState(null);
  const [searchExplanation, setSearchExplanation] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState(null);

  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch('/api/quick-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data.products);
      setSearchExplanation(data.explanation);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => (window.location.hash = "")}
          className="text-blue-500 hover:text-blue-600"
        >
          Back to Home
        </button>
      </div>
      
      {/* Search component */}
      <div className="mb-6">
        <div className="flex mb-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 p-2 border border-gray-300 rounded-l-md"
            placeholder="Search products..."
          />
          <button 
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition"
          >
            Search
          </button>
        </div>
        
        {isSearching && (
          <p className="text-gray-600 italic">Searching...</p>
        )}
        
        {searchError && (
          <p className="text-red-500">Error: {searchError}</p>
        )}
        
        {searchResults && !isSearching && (
          <div className="mt-4">
            <p className="text-gray-600 italic mb-2">{searchExplanation}</p>
            {searchResults.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-600 mt-1">{product.description}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <h2 className="text-xl font-semibold mb-4">All Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p>No products found. Make sure to run the database seed script.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600 mt-1">{product.description}</p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                ${product.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

