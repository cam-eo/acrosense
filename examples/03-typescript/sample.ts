// Example TypeScript code demonstrating AcroSense with TypeScript configuration
// Hover over the acronyms below to see their definitions

interface APIResponse {
  data: unknown;
}

function fetchDataFromAPI(): Promise<APIResponse> {
  // api - Application Programming Interface
  const endpoint = "https://api.example.com/data";
  return fetch(endpoint).then(res => res.json());
}

function createRESTEndpoint(): { method: string; path: string } {
  // rest - Representational State Transfer
  return {
    method: "GET",
    path: "/api/users"
  };
}

function calculateScenarios(): { bc: number; wc: number } {
  const bc = 100; // bc - Best Case
  const wc = 50;  // wc - Worst Case
  return { bc, wc };
}

async function runE2ETests(): Promise<void> {
  // e2e - End-to-End (hover to see extended definition)
  console.log("Running e2e tests...");
}

function designUI(): { ui: { color: string }; ux: { flow: string } } {
  // ui - User Interface
  // ux - User Experience
  const ui = { color: "blue" };
  const ux = { flow: "smooth" };
  return { ui, ux };
}

