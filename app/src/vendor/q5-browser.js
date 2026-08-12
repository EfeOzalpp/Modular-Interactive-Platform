import 'q5/q5.js';

// q5's browser bundle installs the constructor globally instead of exporting it.
// Normalize that bundle to the default export used throughout the application.
const Q5 = window.Q5;

export default Q5;
