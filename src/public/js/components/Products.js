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

  // Create a ref for our QuickSearch component
  const searchRef = React.useRef(null);
  
  // Function to handle search updates
  const handleSearchResults = (event) => {
    // This function could handle search results in the future
    // For now we're letting the web component handle the display
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
      
      {/* Embed our QuickSearch web component */}
      <div className="mb-6" ref={searchRef}>
        <quick-search></quick-search>
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

