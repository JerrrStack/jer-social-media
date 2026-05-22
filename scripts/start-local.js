const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });

const port = process.argv[2] || process.env.PORT || "3001";
process.env.PORT = port;

console.log(`Server starting at http://localhost:${port}`);
console.log(`Node ${process.version} (use npm run dev — includes --openssl-legacy-provider for Node 17+)`);

require(path.join(__dirname, "..", "server.js"));
