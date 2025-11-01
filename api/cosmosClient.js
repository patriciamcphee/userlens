const { CosmosClient } = require("@azure/cosmos");

// These come from Azure Functions environment variables (no VITE_ prefix)
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || "UserTestingDB";

if (!endpoint || !key) {
  console.error("Missing Cosmos DB configuration!");
  console.error("Required environment variables:");
  console.error("  - COSMOS_DB_ENDPOINT");
  console.error("  - COSMOS_DB_KEY");
  console.error("  - COSMOS_DB_DATABASE (optional, defaults to UserTestingDB)");
  throw new Error("Cosmos DB configuration missing. Set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.");
}

const client = new CosmosClient({ endpoint, key });

async function getContainer(containerId) {
  const database = client.database(databaseId);
  const container = database.container(containerId);
  return container;
}

module.exports = { getContainer, client, databaseId };