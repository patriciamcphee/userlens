const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || "insighthub";

console.log('Cosmos DB Configuration:');
console.log('  Endpoint:', endpoint);
console.log('  Key:', key ? '✓ Set' : '✗ Missing');
console.log('  Database:', databaseId);

if (!endpoint || !key) {
  console.error("Missing Cosmos DB configuration!");
  throw new Error("Cosmos DB configuration missing. Set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.");
}

const client = new CosmosClient({ endpoint, key });

/**
 * Get a container from the database
 * @param {string} containerId - The container name (e.g., "projects", "participants")
 * @returns {Promise<Container>} - The CosmosDB container
 */
async function getContainer(containerId) {
  try {
    console.log(`Accessing database: ${databaseId}, container: ${containerId}`);
    
    const database = client.database(databaseId);
    const container = database.container(containerId);
    
    // Test the connection
    const { resource } = await container.read();
    console.log(`Successfully connected to container: ${containerId}`);
    
    return container;
  } catch (error) {
    console.error(`Error accessing container ${containerId}:`, error.message);
    throw new Error(`Failed to access container ${containerId}: ${error.message}`);
  }
}

/**
 * Extract tenant ID from Azure AD token (for multi-tenancy)
 * @param {object} req - The HTTP request
 * @returns {string|null} - The tenant ID or null
 */
function extractTenantId(req) {
  // Azure Static Web Apps passes authenticated user info in headers
  const clientPrincipal = req.headers['x-ms-client-principal'];
  
  if (clientPrincipal) {
    try {
      const decoded = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('utf8'));
      // The tenant ID is in the claims
      const tenantClaim = decoded.claims?.find(c => c.typ === 'tid' || c.typ === 'http://schemas.microsoft.com/identity/claims/tenantid');
      return tenantClaim?.val || null;
    } catch (error) {
      console.error('Error decoding client principal:', error);
    }
  }
  
  return null;
}

/**
 * Extract user info from Azure AD token
 * @param {object} req - The HTTP request
 * @returns {object|null} - User info object or null
 */
function extractUserInfo(req) {
  const clientPrincipal = req.headers['x-ms-client-principal'];
  
  if (clientPrincipal) {
    try {
      const decoded = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('utf8'));
      return {
        userId: decoded.userId,
        userDetails: decoded.userDetails,
        identityProvider: decoded.identityProvider,
        userRoles: decoded.userRoles || [],
        claims: decoded.claims || []
      };
    } catch (error) {
      console.error('Error decoding client principal:', error);
    }
  }
  
  return null;
}

module.exports = { 
  getContainer, 
  client, 
  databaseId,
  extractTenantId,
  extractUserInfo
};
