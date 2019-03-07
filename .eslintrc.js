module.exports = {
    plugins: ["prettier", "react-hooks"],
    rules: {
      "prettier/prettier": [1, { trailingComma: "es5", singleQuote: true }],
      "react-hooks/rules-of-hooks": "error",
    },
    extends: ["prettier", "react-app"]
  };
   