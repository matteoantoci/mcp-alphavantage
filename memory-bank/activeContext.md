## Active Context: Alpha Vantage MCP Server

### Current Work Focus

The primary focus has been on enhancing the `insider_transactions` tool within the Alpha Vantage MCP server. The user requested the ability to filter insider transactions by a date range.

### Recent Changes

-   **`src/tools/intelligence/insiderTransactions.ts`**:
    -   Added optional `startDate` (YYYY-MM-DD) and `endDate` (YYYY-MM-DD) parameters to the `insiderTransactionsInputSchemaShape`.
    -   Updated the `insiderTransactionsHandler` to accept these new parameters.
    -   Implemented filtering logic within the handler to process the full API response and return only transactions falling within the specified date range (inclusive). This client-side filtering is necessary as the Alpha Vantage API for insider transactions does not natively support date range parameters.
    -   The `datatype` parameter remains hardcoded to `json` as per previous requirements.

### Next Steps

-   Thoroughly test the updated `insider_transactions` tool with various combinations of `startDate` and `endDate` (including cases where one or both are omitted) to ensure the filtering logic works correctly and handles edge cases.
-   Update `progress.md` to reflect the new functionality and testing requirements.
-   Proceed with implementing automated tests for the project, including tests for the caching mechanism and the newly added date filtering in `insiderTransactions`.

### Active Decisions and Considerations

-   **Client-Side Filtering**: Due to the Alpha Vantage API not supporting date filtering for insider transactions, the filtering logic has been implemented within the tool's handler function. This means the tool will always fetch all available data for the given symbol and then filter it locally. This could have performance implications for symbols with a very large number of transactions, but it fulfills the user's requirement.
-   **Date Format**: The date format for `startDate` and `endDate` is YYYY-MM-DD. The filtering logic correctly parses these dates for comparison.
-   **Caching**: The existing LRU cache in `wrapToolHandler.ts` will cache the *unfiltered* response from the Alpha Vantage API for `insider_transactions`. The date filtering will be applied *after* retrieving from the cache or fetching from the API. This is the most efficient approach as it caches the raw, complete dataset.
