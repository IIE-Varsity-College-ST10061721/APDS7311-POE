// client/jest.config.js
module.exports = {
    transform: {
      "^.+\\.[t|j]sx?$": "babel-jest",
    },
    transformIgnorePatterns: [
      "node_modules/(?!(axios)/)", // Add other problematic dependencies if needed
    ],
  };
  