# JavaScript Configuration Example

This example demonstrates configuring AcroSense using a JavaScript file with CommonJS exports.

## What's in this example?

- `acros.js` - A JavaScript file exporting acronym definitions using `module.exports`
- `sample.js` - Sample code demonstrating how acronyms are highlighted and shown on hover

## How to use

1. Copy `acros.js` to your project root
2. Open `sample.js` in VS Code
3. Hover over any of the acronyms to see their definitions

## When to use this method

- You want to compute acronyms dynamically
- You need to generate definitions programmatically
- You prefer JavaScript over JSON
- You want to use variables or functions to build your acronym list
- You're already using JavaScript in your project

## Export formats supported

AcroSense supports multiple JavaScript export formats:

**CommonJS (this example):**
```javascript
module.exports = {
  api: "Application Programming Interface"
};
```

**ES Module default export:**
```javascript
export default {
  api: "Application Programming Interface"
};
```

**Named exports (merged):**
```javascript
export const common = {
  api: "Application Programming Interface"
};

export const testing = {
  e2e: "End-to-End"
};
```

## Dynamic example

You can also generate acronyms dynamically:

```javascript
const acronyms = {};
const terms = [
  { key: "api", value: "Application Programming Interface" },
  { key: "ui", value: "User Interface" }
];

terms.forEach(term => {
  acronyms[term.key] = term.value;
});

module.exports = acronyms;
```

