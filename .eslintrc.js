module.exports = {
  plugins: ["prettier", "react-hooks", "function-return-assigned-name"],
  rules: {
    "prettier/prettier": [1, { trailingComma: "es5", singleQuote: true }],
    "react-hooks/rules-of-hooks": "error",
    "function-return-assigned-name/function-return-assigned-name": [
      "error",
      {
        allowObjectProperties: false,
        allowReturn: false,
        functionName: /^createUse[A-Z0-9].*$/,
        variableName: /^use[A-Z0-9].*$/
      }
    ]
  },
  extends: ["prettier", "react-app"]
};
