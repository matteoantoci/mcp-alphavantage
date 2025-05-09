import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Import individual tool definitions for options
import { historicalOptionsTool } from './historicalOptions.js';

/**
 * Registers all Alpha Vantage Options tools with the MCP server.
 * @param server The McpServer instance.
 * @param apiKey The Alpha Vantage API key.
 */
export const registerOptionsTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage Options tools...');
  // Register individual tools
  server.tool(
    historicalOptionsTool.name,
    historicalOptionsTool.description,
    historicalOptionsTool.inputSchemaShape,
    (input) => historicalOptionsTool.handler(input, apiKey)
  );

  console.log('Finished registering Alpha Vantage Options tools.');
};
