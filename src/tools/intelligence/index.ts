import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { wrapToolHandler } from '../wrapToolHandler.js'; // Import the wrapper
// Import individual tool definitions for intelligence
import { newsSentimentTool } from './newsSentiment.js';
import { earningsCallTranscriptTool } from './earningsCallTranscript.js';
import { topGainersLosersTool } from './topGainersLosers.js';
import { insiderTransactionsTool } from './insiderTransactions.js';
import { analyticsFixedWindowTool } from './analyticsFixedWindow.js';
import { analyticsSlidingWindowTool } from './analyticsSlidingWindow.js';

/**
 * Registers all Alpha Vantage Intelligence tools with the MCP server.
 * @param server The McpServer instance.
 * @param apiKey The Alpha Vantage API key.
 */
export const registerIntelligenceTools = (server: McpServer, apiKey: string): void => {
  console.log('Registering Alpha Vantage Intelligence tools...');
  // Register individual tools
  server.tool(
    newsSentimentTool.name,
    newsSentimentTool.description,
    newsSentimentTool.inputSchemaShape,
    wrapToolHandler((input) => newsSentimentTool.handler(input, apiKey))
  );
  server.tool(
    earningsCallTranscriptTool.name,
    earningsCallTranscriptTool.description,
    earningsCallTranscriptTool.inputSchemaShape,
    wrapToolHandler((input) => earningsCallTranscriptTool.handler(input, apiKey))
  );
  // topGainersLosersTool has an empty input schema, so its handler does not expect 'input'
  server.tool(
    topGainersLosersTool.name,
    topGainersLosersTool.description,
    topGainersLosersTool.inputSchemaShape,
    wrapToolHandler(() => topGainersLosersTool.handler(apiKey))
  );
  server.tool(
    insiderTransactionsTool.name,
    insiderTransactionsTool.description,
    insiderTransactionsTool.inputSchemaShape,
    wrapToolHandler((input) => insiderTransactionsTool.handler(input, apiKey))
  );
  server.tool(
    analyticsFixedWindowTool.name,
    analyticsFixedWindowTool.description,
    analyticsFixedWindowTool.inputSchemaShape,
    wrapToolHandler((input) => analyticsFixedWindowTool.handler(input, apiKey))
  );
  server.tool(
    analyticsSlidingWindowTool.name,
    analyticsSlidingWindowTool.description,
    analyticsSlidingWindowTool.inputSchemaShape,
    wrapToolHandler((input) => analyticsSlidingWindowTool.handler(input, apiKey))
  );

  console.log('Finished registering Alpha Vantage Intelligence tools.');
};
