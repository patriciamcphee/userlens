const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || "UserTestingDB";

console.log('Cosmos DB Configuration:');
console.log('  Endpoint:', endpoint ? '✓ Set' : '✗ Missing');
console.log('  Key:', key ? '✓ Set' : '✗ Missing');
console.log('  Database:', databaseId);

if (!endpoint || !key) {
  console.error("Missing Cosmos DB configuration!");
  console.error("Required environment variables:");
  console.error("  - COSMOS_DB_ENDPOINT");
  console.error("  - COSMOS_DB_KEY");
  throw new Error("Cosmos DB configuration missing");
}

const client = new CosmosClient({ endpoint, key });

async function getContainer(containerId) {
  try {
    const database = client.database(databaseId);
    const container = database.container(containerId);
    
    // Test the connection
    await container.read();
    
    return container;
  } catch (error) {
    console.error(`Error accessing container ${containerId}:`, error);
    throw new Error(`Failed to access container ${containerId}: ${error.message}`);
  }
}

module.exports = { getContainer, client, databaseId };