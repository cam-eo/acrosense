// Example code demonstrating AcroSense advanced features
// Notice the different highlight colors for different acronyms
// Hover over acronyms to see extended definitions

// Custom color: Light blue background
function fetchDataFromAPI() {
  // api - Application Programming Interface (hover for extended definition)
  const endpoint = "https://api.example.com/data";
  return fetch(endpoint);
}

// Custom color: Light green background
function createRESTEndpoint() {
  // rest - Representational State Transfer (hover for extended definition)
  return {
    method: "GET",
    path: "/api/users"
  };
}

// Custom color: Light orange background
function setupGraphQL() {
  // graphql - Graph Query Language (hover for extended definition)
  return {
    schema: "schema.graphql",
    resolvers: {}
  };
}

// Default color: Yellow background (from global bg)
function runE2ETests() {
  // e2e - End-to-End (uses default color)
  console.log("Running e2e tests...");
}

// Custom color: Light pink background
function designUI() {
  // ui - User Interface (custom color, no extended definition)
  const ui = { color: "blue" };
  return ui;
}

// Default color: Yellow background (from global bg)
function improveUX() {
  // ux - User Experience (uses default color)
  const ux = { flow: "smooth" };
  return ux;
}

// Mixed usage in one function
function buildFullStackApp() {
  // Different colors help distinguish acronym types
  const api = "https://api.example.com";        // Light blue
  const restEndpoint = "/users";                 // Light green
  const graphqlSchema = "schema.graphql";       // Light orange
  const ui = { component: "Button" };           // Light pink
  const ux = { flow: "smooth" };                // Yellow (default)
  
  return { api, restEndpoint, graphqlSchema, ui, ux };
}

