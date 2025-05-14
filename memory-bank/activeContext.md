## Active Context: Alpha Vantage MCP Server

### Current Work Focus

The primary focus has been a major architectural refactor to centralize all Alpha Vantage API calls through a shared `AlphaVantageClient` instance, which implements an LRU cache at the client level. This ensures that all tools (including stocks, options, fundamentals, indicators, economic indicators, intelligence, and crypto) benefit from a unified cache, preventing redundant cache entries due to client-side filters or tool-specific logic.

### Recent Changes

- **Created `src/alphaVantageClient.ts`**: Implements the shared API client and LRU cache.
- **Refactored all tool handlers** (including all crypto tools: `currencyExchangeRate`, `digitalCurrencyDaily`, `digitalCurrencyWeekly`, `digitalCurrencyMonthly`) to:
  - Accept an `AlphaVantageClient` instance instead of an `apiKey`.
  - Use the client's `fetchApiData` method with a standardized `AlphaVantageApiParams` object.
  - Remove direct fetch logic and URL construction from handlers.
- **Updated all tool registration files** (e.g., `src/tools/crypto/index.ts`) to:
  - Accept and pass the shared client instance.
  - Use `inputSchemaShape` for schema registration.
- **Removed caching logic from `wrapToolHandler.ts`**: All caching is now handled at the client level.
- **Deleted `src/cacheService.ts`**: No longer needed with the new architecture.

### Next Steps

- Update `progress.md` to reflect the completion of the client-level cache refactor and the migration of all tools to the new architecture.
- Review and update documentation in `systemPatterns.md` and `techContext.md` to describe the new client/caching pattern.
- Conduct thorough testing of all tools to ensure correct cache behavior and no regressions in tool functionality.
- Consider implementing or updating automated tests for the new client and cache logic.

### Active Decisions and Considerations

- **Centralized LRU Cache**: The LRU cache is now implemented at the `AlphaVantageClient` level, keyed by API parameters only. This prevents different client-side filters from polluting the cache and ensures maximum cache efficiency across all tools.
- **Dependency Injection**: All tool handlers now receive the client instance, promoting testability and separation of concerns.
- **TypeScript Module Resolution**: All imports of the client use the `.js` extension to comply with Node 16+ ESM resolution.
- **Client-Side Filtering**: Where necessary (e.g., for tools like `insiderTransactions`), client-side filtering is still performed after retrieving the raw API response from the cache or API.
