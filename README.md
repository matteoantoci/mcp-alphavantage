# Alpha Vantage MCP Server

A Model Context Protocol (MCP) server that exposes various Alpha Vantage API endpoints as MCP tools, providing access to financial data including core stocks, options, intelligence, fundamental data, and technical indicators. This server simplifies integrating Alpha Vantage data into MCP-compatible agents and systems.

## Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)
- Alpha Vantage API key
- (Optional) MCP-compatible client or runner (e.g., VSCode extension, CLI)

## Setup

1. **Clone the repository or ensure you are in the project directory.**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configuration:**
   * Obtain an Alpha Vantage API key from [https://www.alphavantage.co/](https://www.alphavantage.co/).
   * Configure the `ALPHAVANTAGE_API_KEY` environment variable via your MCP runner's settings. This is the recommended method for seamless integration with the MCP client. Avoid using `.env` files for this purpose when running via an MCP runner.

## Building and Running

1. **Build the server:**
   ```bash
   npm run build
   ```
   This will create a `build` directory with the compiled JavaScript code.

2. **Run the server:**
   ```bash
   npm run start
   ```
   or directly:
   ```bash
   node build/index.js
   ```

3. **Via MCP runner:**
   Configure your MCP client to run the server using stdio transport.
   Example MCP settings entry (adjust `/path/to/mcp-alphavantage` to your actual path and replace `YOUR_API_KEY_HERE` with your actual key):
   ```json
   "alphavantage": {
     "transportType": "stdio",
     "command": "node",
     "args": [
       "/path/to/mcp-alphavantage/build/index.js"
     ],
     "env": {
       "ALPHAVANTAGE_API_KEY": "YOUR_API_KEY_HERE"
     }
     // ... other optional settings ...
   }
   ```

## Available Tools

The server exposes Alpha Vantage API endpoints as distinct MCP tools, categorized by function:

- Core Stocks
- Options Data
- Alpha Intelligence
- Fundamental Data
- Technical Indicators
- Forex
- Cryptocurrencies
- Commodities
- Economic Indicators

Detailed input schemas and descriptions for each tool are automatically discoverable by MCP agents connecting to the server via introspection.

## Project Structure

The project follows a modular structure:

```
.
├── src/
│   ├── index.ts          # Server entry point
│   └── tools/
│       ├── index.ts      # Registers all tool categories
│       ├── fundamentals/ # Fundamental Data tools
│       │   └── ...
│       ├── indicators/   # Technical Indicators tools
│       │   └── ...
│       ├── intelligence/ # Alpha Intelligence tools
│       │   └── ...
│       ├── options/      # Options Data tools
│       │   └── ...
│       ├── stocks/       # Core Stocks tools
│       │   └── ...
│       ├── forex/        # Forex tools
│       │   └── ...
│       ├── crypto/       # Cryptocurrency tools
│       │   └── ...
│       ├── commodities/  # Commodities tools
│       │   └── ...
│       └── economic/     # Economic Indicators tools
│           └── ...
├── memory-bank/          # Project documentation
│   └── ...
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint configuration
├── .prettierrc           # Prettier configuration
├── LICENSE               # Project license
└── README.md             # This file
```

## Licensing

This project is licensed under the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. See the `LICENSE` file for details.

## Contributing

Contributions are welcome! Please follow the standard fork-and-pull request workflow.

## Support

For issues or questions, please open an issue on the GitHub repository.
