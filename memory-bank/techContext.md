# Technical Context: Alpha Vantage MCP Server

## Technologies Used

- **TypeScript:** Primary language for server development.
- **Node.js:** Runtime environment for the server.
- **@modelcontextprotocol/sdk:** Core library for building the MCP server.
- **Zod:** Library for defining and validating tool input schemas.
- **Native Fetch API:** Used for making HTTP requests (requires Node.js 18+).

## Development Setup

- **Prerequisites:** Node.js (version 18 or higher recommended), npm or yarn.
- **Installation:** Clone the repository, navigate to the project directory, and run `npm install` or `yarn install`.
- **Configuration:** Set the `ALPHAVANTAGE_API_KEY` environment variable with a valid Alpha Vantage API key.
- **Building:** Compile the TypeScript code using `tsc`.
- **Running:** Execute the compiled JavaScript code (`node dist/index.js`).

## Technical Constraints

- **Alpha Vantage API Limits:** Adherence to Alpha Vantage API rate limits and usage policies is required.
- **Node.js Version:** Requires Node.js 18+ for native fetch support.
- **Excluded Endpoints:** Premium Alpha Vantage endpoints and certain non-trending technical indicators were intentionally excluded from the initial implementation scope.

## Dependencies

- `@modelcontextprotocol/sdk`
- `zod`
- `typescript`
- Development dependencies (e.g., testing frameworks, linters, formatters) are managed via `package.json`.
