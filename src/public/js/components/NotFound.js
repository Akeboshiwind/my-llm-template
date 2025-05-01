// Create namespace for components
window.App = window.App || {};
window.App.Components = window.App.Components || {};

// Not Found Component
window.App.Components.NotFound = () => (
  <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md text-center">
    <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="mb-4">The page you are looking for doesn't exist.</p>
    <button
      onClick={() => (window.location.hash = "")}
      className="text-blue-500 hover:text-blue-600"
    >
      Go back to home
    </button>
  </div>
);

