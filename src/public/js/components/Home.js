// Create namespace for components
window.App = window.App || {};
window.App.Components = window.App.Components || {};

// Home Component
window.App.Components.Home = () => {
  const { useState, useEffect } = React;

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hello")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching message:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Welcome to PLACEHOLDER</h1>
      <p className="mb-4">A simple template for building apps with LLMs.</p>

      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <h2 className="text-lg font-semibold mb-2">API Response:</h2>
        {loading ? (
          <p>Loading...</p>
        ) : message ? (
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(message, null, 2)}
          </pre>
        ) : (
          <p>Failed to load message</p>
        )}
      </div>

      <button
        onClick={() => (window.location.hash = "#products")}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
      >
        View Products
      </button>
    </div>
  );
};

