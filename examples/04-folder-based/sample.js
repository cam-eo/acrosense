// Example code demonstrating AcroSense with folder-based configuration
// All acronyms from acros/ folder are merged and available
// Hover over the acronyms below to see their definitions

// Common acronyms (from acros/common.json)
function fetchDataFromAPI() {
  // api - Application Programming Interface
  const endpoint = "https://api.example.com/data";
  return fetch(endpoint);
}

function designUI() {
  // ui - User Interface
  // ux - User Experience
  const ui = { color: "blue" };
  const ux = { flow: "smooth" };
  return { ui, ux };
}

// Domain-specific acronyms (from acros/domain.json)
function createRESTEndpoint() {
  // rest - Representational State Transfer
  return {
    method: "GET",
    path: "/api/users"
  };
}

function setupGraphQL() {
  // graphql - Graph Query Language
  return {
    schema: "schema.graphql",
    resolvers: {}
  };
}

function useORM() {
  // orm - Object-Relational Mapping
  return {
    model: "User",
    table: "users"
  };
}

// Testing acronyms (from acros/testing.js)
async function runE2ETests() {
  // e2e - End-to-End
  console.log("Running e2e tests...");
}

function writeUnitTests() {
  // unit - Unit Test
  console.log("Writing unit tests...");
}

function runIntegrationTests() {
  // integration - Integration Test
  console.log("Running integration tests...");
}

