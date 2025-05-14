import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
import type { AlphaVantageClient } from '../../alphaVantageClient.js';
// Import individual tool definitions for options
import { historicalOptionsTool } from './historicalOptions.js';

/**
 * Registers all Alpha Vantage Options tools with the MCP server.
 * @param server The McpServer instance.
 * @param client The Alpha Vantage client instance.
 */
export const registerOptionsTools = (server: McpServer, client: AlphaVantageClient): void => {
  console.log('Registering Alpha Vantage Options tools...');
  // Register individual tools
  server.tool(
    historicalOptionsTool.name,
    historicalOptionsTool.description,
    historicalOptionsTool.inputSchemaShape,
    wrapToolHandler((input) => historicalOptionsTool.handler(input, client))
  );

  console.log('Finished registering Alpha Vantage Options tools.');
};
