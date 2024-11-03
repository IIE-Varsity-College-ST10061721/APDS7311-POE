module.exports = {
    preset: "react-app",
    transformIgnorePatterns: [
      "node_modules/(?!axios)"  // Add other modules if needed
    ],
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    }
  };
  