// Create app namespace
window.App = window.App || {};

// Access the React hooks
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// Main App with hash-based routing
window.App.MainApp = () => {
  const [route, setRoute] = useState(window.location.hash || "");

  // Get components from namespace
  const { Home, Products, NotFound } = window.App.Components;

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Render component based on route
  const renderComponent = () => {
    switch (route) {
      case "":
      case "#":
        return <Home />;
      case "#products":
        return <Products />;
      default:
        return <NotFound />;
    }
  };

  return <div className="py-8">{renderComponent()}</div>;
};

// Export the renderApp function
window.renderApp = function () {
  console.log("Rendering the application");

  // Make sure components are loaded
  if (
    window.App.Components &&
    window.App.Components.Home &&
    window.App.Components.Products &&
    window.App.Components.NotFound
  ) {
    const rootElement = document.getElementById("root");
    const root = createRoot(rootElement);
    root.render(<window.App.MainApp />);
    console.log("App rendered successfully");
  } else {
    console.error("Components not loaded properly");
  }
};
