// This file is in tests/ directory
// There's no acros.json in tests/, so it uses root acros.json
// Hover over acronyms to see which config applies

// From root acros.json (no nested config in tests/)
function testAPI() {
  // api - Application Programming Interface
  return fetch("https://api.example.com/test");
}

function testUI() {
  // ui - User Interface
  return { component: "Button" };
}

function testUX() {
  // ux - User Experience
  return { flow: "smooth" };
}

function testDB() {
  // db - Database
  return { query: "SELECT * FROM users" };
}

// Note: src/ acronyms (orm, dto, repo, svc) are NOT available here
// because tests/ uses root acros.json, not src/acros.json

