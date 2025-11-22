// This file is in src/ directory
// It uses src/acros.json for acronyms
// Hover over acronyms to see which config applies

// From src/acros.json (nested config takes precedence)
function createDTO() {
  // dto - Data Transfer Object
  return { id: 1, name: "John" };
}

function useORM() {
  // orm - Object-Relational Mapping
  return { model: "User" };
}

function getRepository() {
  // repo - Repository
  return { find: () => {} };
}

function callService() {
  // svc - Service
  return { execute: () => {} };
}

// These would use root acros.json if not defined in src/acros.json
// But since we have src/acros.json, only src acronyms are available here
// To use root acronyms, you'd need to define them in src/acros.json too

