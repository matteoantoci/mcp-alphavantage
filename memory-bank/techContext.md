# Technical Context: Alpha Vantage MCP Server

## Technologies Used

- **TypeScript:** Primary language for server development.
- **Node.js:** Runtime environment for the server.
- **@modelcontextprotocol/sdk:** Core library for building the MCP server.
- **Zod:** Library for defining and validating tool input schemas.
- **Native Fetch API:** Used for making HTTP requests (requires Node.js 18+).
- **lru-cache:** Used for implementing the in-memory LRU cache, now centralized in the `AlphaVantageClient` for all tool results.
- **AlphaVantageClient:** Custom client module that centralizes all Alpha Vantage API calls and manages caching, API key usage, and request deduplication.

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
- **Cache Size:** The LRU cache in `AlphaVantageClient` has a maximum size to prevent excessive memory consumption.
- **Module Resolution:** All imports of the client use the `.js` extension to comply with Node 16+ ESM resolution.

## Dependencies

- `@modelcontextprotocol/sdk`
- `zod`
- `typescript`
- `lru-cache`
- Development dependencies (e.g., testing frameworks, linters, formatters) are managed via `package.json`.

## Additional Notes

- **Dependency Injection:** All tool handlers receive the shared `AlphaVantageClient` instance, promoting testability and separation of concerns.
- **Centralized Caching:** The previous `cacheService.ts` and caching logic in `wrapToolHandler.ts` have been removed. All caching is now handled by the client, keyed by API parameters only.
- **Client-Side Filtering:** Where necessary, client-side filtering is performed after retrieving the raw API response from the cache or API (e.g., for date filtering in `insiderTransactions`).
