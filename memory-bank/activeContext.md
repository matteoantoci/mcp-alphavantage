## Active Context: Alpha Vantage MCP Server

### Current Work Focus

The primary focus has been on refactoring and enhancing specific tools. The `earningsCallTranscript.ts` tool has been significantly updated with new filtering capabilities and improved code structure. Work also continues on the broader architectural refactor involving the `AlphaVantageClient`.

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
- **Refactored `earningsCallTranscript.ts` tool:**
    *   Added new filtering parameters: `speakers`, `sections` (heuristic), `keywords`, `exclude_boilerplate` (heuristic), `min_sentiment`, `max_sentiment`, `max_segments`.
    *   Removed placeholder/unused filters: `context_sentences`, `return_summary`, `summary_detail`.
    *   Implemented client-side filtering logic using a pipeline of pure helper functions defined at the module scope.
    *   Ensured adherence to functional programming principles (immutability, `const`, `map`/`filter`/`reduce`).
    *   Updated Zod input and output schemas for the tool.
    *   Confirmed `npm run lint` passes for the modified file.

### Next Steps

- Update `progress.md` to reflect the completion of the client-level cache refactor and the migration of all tools to the new architecture.
- Review and update documentation in `systemPatterns.md` and `techContext.md` to describe the new client/caching pattern.
- Conduct thorough testing of all tools to ensure correct cache behavior and no regressions in tool functionality.
- Consider implementing or updating automated tests for the new client and cache logic.
- Write specific unit tests for the new filtering logic in `earningsCallTranscript.ts`.

### Active Decisions and Considerations

- **Centralized LRU Cache**: The LRU cache is now implemented at the `AlphaVantageClient` level, keyed by API parameters only. This prevents different client-side filters from polluting the cache and ensures maximum cache efficiency across all tools.
- **Dependency Injection**: All tool handlers now receive the client instance, promoting testability and separation of concerns.
- **TypeScript Module Resolution**: All imports of the client use the `.js` extension to comply with Node 16+ ESM resolution.
- **Client-Side Filtering**: Where necessary (e.g., for tools like `insiderTransactions`), client-side filtering is still performed after retrieving the raw API response from the cache or API.
