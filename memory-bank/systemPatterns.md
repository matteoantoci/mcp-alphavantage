# System Patterns: Alpha Vantage MCP Server

## System Architecture

The Alpha Vantage MCP server follows a modular architecture designed for scalability and maintainability. It is built as a Node.js application using TypeScript. The core of the architecture is the MCP server SDK, which handles tool registration and execution.

## Key Technical Decisions

- **TypeScript:** Chosen for type safety, improved code quality, and maintainability.
- **@modelcontextprotocol/sdk:** Used as the foundation for building the MCP server and defining tools.
- **Zod for Schema Validation:** Ensures that tool inputs are correctly structured and validated before processing.
- **Native Fetch:** Used for making HTTP requests to the Alpha Vantage API, leveraging built-in Node.js capabilities (requires Node.js 18+).
- **Environment Variables:** API keys and other sensitive configuration are managed via environment variables for security.

## Design Patterns in Use

- **Modular Design:** Each Alpha Vantage API endpoint is implemented as a distinct tool, encapsulated within its own file with a clear schema, handler, and registration.
- **Categorization:** Tools are grouped by Alpha Vantage API categories (Stocks, Options, Intelligence, Fundamentals, Indicators) into separate directories for organization.
- **Index Files:** Index files (`index.ts`) within each category directory and the main `src/tools/index.ts` file are used to register and export tools, simplifying the server's main entry point (`src/index.ts`).

## Component Relationships

- `src/index.ts`: Initializes the MCP server and imports/registers tool groups from `src/tools/index.ts`.
- `src/tools/index.ts`: Imports and registers individual tool groups (e.g., `src/tools/stocks/index.ts`).
- `src/tools/[category]/index.ts`: Imports and registers individual tools within that category (e.g., `src/tools/stocks/globalQuote.ts`).
- `src/tools/[category]/[toolName].ts`: Contains the Zod schema, handler function, and tool definition for a specific Alpha Vantage endpoint.
- Handlers within tool files use native fetch to interact with the Alpha Vantage API.
- A caching layer is implemented using `lru-cache` to store results of tool calls based on their parameters and a configurable Time To Live (TTL). This is handled transparently by the `wrapToolHandler`.
