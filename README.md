# Sarathi partner order status mcp
# A Cloudflare Worker that exposes a `get_order_status` tool for Sarathi Commerce partners. Built with security, compliance, and scalability in mind.
Local Cloudflare Worker that lets a retail partner's shopping or support agent ask "where is my order?" without scraping the tracking page.
# Steps to Setup and Run the MCP Agents
## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (Cloudflare's tool for Workers)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/chandrakantasamal/sarathi-mcp.git
   cd sarathi-mcp
### Install dependencies
npm install
### Start the Cloudflare Worker in development mode
npm run dev
###  The Worker will run on http://localhost:8787 or http://localhost:8788 depending on your machine port availbility
# Open a new Terminal , let the first terminal run , dont close it.
# Success Case (Partner1 accessing their own order). Must check the PORT Number and repalce with actual running port of terminal 1 MCP server
curl -X POST http://localhost:8788/mcp \
  -H "Content-Type: application/json" \
  -H "X-Partner-Key: key123" \
  -d '{"tool": "get_order_status", "arguments": {"partnerId": "partner1", "orderId": "order123"}}'

# Failure Case (Unauthorized order access):Must check the PORT Number and repalce with actual running port of terminal 1 MCP server
curl -X POST http://localhost:8788/mcp \
  -H "Content-Type: application/json" \
  -H "X-Partner-Key: key123" \
  -d '{"tool": "get_order_status", "arguments": {"partnerId": "partner1", "orderId": "order789"}}'
  
