import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js'; // This will register all tools from sub-indices

const main = async () => {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!apiKey) {
    console.error('ALPHAVANTAGE_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const server = new McpServer({
    name: 'mcp-alphavantage',
    version: '1.0.0', // Starting version
    description: 'MCP Server exposing Alpha Vantage financial data and technical indicators.',
    // Add authentication if needed
  });

  // Register all tools from the different API groups
  registerTools(server, apiKey);

  console.log('Starting MCP Alpha Vantage Server...');
  // Use Stdio transport to connect
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log(`Server "mcp-alphavantage" connected via stdio.`);
};

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
