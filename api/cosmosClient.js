const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || "UserTestingDB";

console.log('Cosmos DB Configuration:');
console.log('  Endpoint:', endpoint);
console.log('  Key:', key ? '✓ Set' : '✗ Missing');
console.log('  Database:', databaseId);
console.log('  Database from env:', process.env.COSMOS_DB_DATABASE);

if (!endpoint || !key) {
  console.error("Missing Cosmos DB configuration!");
  throw new Error("Cosmos DB configuration missing");
}

const client = new CosmosClient({ endpoint, key });

async function getContainer(containerId) {
  try {
    console.log(`Attempting to access database: ${databaseId}, container: ${containerId}`);
    
    const database = client.database(databaseId);
    const container = database.container(containerId);
    
    // Test the connection
    const { resource } = await container.read();
    console.log(`Successfully connected to container: ${containerId}`);
    console.log(`Partition key:`, resource.partitionKey);
    
    return container;
  } catch (error) {
    console.error(`Error accessing container ${containerId}:`, error.message);
    console.error(`Full error:`, JSON.stringify(error, null, 2));
    throw new Error(`Failed to access container ${containerId}: ${error.message}`);
  }
}

module.exports = { getContainer, client, databaseId };