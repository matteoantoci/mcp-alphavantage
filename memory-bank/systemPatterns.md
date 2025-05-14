# System Patterns: Alpha Vantage MCP Server

## System Architecture

The Alpha Vantage MCP server follows a modular architecture designed for scalability and maintainability. It is built as a Node.js application using TypeScript. The core of the architecture is the MCP server SDK, which handles tool registration and execution. All Alpha Vantage API calls are routed through a centralized `AlphaVantageClient` instance, which manages caching and API key usage.

## Key Technical Decisions

- **TypeScript:** Chosen for type safety, improved code quality, and maintainability.
- **@modelcontextprotocol/sdk:** Used as the foundation for building the MCP server and defining tools.
- **Zod for Schema Validation:** Ensures that tool inputs are correctly structured and validated before processing.
- **Native Fetch:** Used for making HTTP requests to the Alpha Vantage API, leveraging built-in Node.js capabilities (requires Node.js 18+).
- **Environment Variables:** API keys and other sensitive configuration are managed via environment variables for security.
- **Centralized API Client & LRU Cache:** All tool handlers use a shared `AlphaVantageClient` instance, which implements an LRU cache at the client level. This cache is keyed by API parameters only, ensuring cache efficiency and preventing redundant entries due to client-side filters.

## Design Patterns in Use

- **Modular Design:** Each Alpha Vantage API endpoint is implemented as a distinct tool, encapsulated within its own file with a clear schema, handler, and tool definition.
- **Categorization:** Tools are grouped by Alpha Vantage API categories (Stocks, Options, Intelligence, Fundamentals, Indicators, Crypto, Economic Indicators) into separate directories for organization.
- **Index Files:** Index files (`index.ts`) within each category directory and the main `src/tools/index.ts` file are used to register and export tools, simplifying the server's main entry point (`src/index.ts`).
- **Dependency Injection:** All tool handlers receive the shared `AlphaVantageClient` instance as a parameter, promoting testability and separation of concerns.
- **Client-Level Caching:** Caching is handled exclusively by the `AlphaVantageClient`. The previous cache service and caching logic in `wrapToolHandler.ts` have been removed.

## Component Relationships

- `src/index.ts`: Initializes the MCP server, creates the shared `AlphaVantageClient`, and imports/registers tool groups from `src/tools/index.ts`.
- `src/tools/index.ts`: Imports and registers individual tool groups (e.g., `src/tools/stocks/index.ts`), passing the client instance.
- `src/tools/[category]/index.ts`: Imports and registers individual tools within that category (e.g., `src/tools/stocks/globalQuote.ts`), passing the client instance to each handler.
- `src/tools/[category]/[toolName].ts`: Contains the Zod schema, handler function (which receives the client), and tool definition for a specific Alpha Vantage endpoint.
- All handlers use the shared `AlphaVantageClient` to interact with the Alpha Vantage API and benefit from the centralized LRU cache.
- The caching layer is now implemented in `src/alphaVantageClient.ts` and is transparent to tool registration and handler logic.
