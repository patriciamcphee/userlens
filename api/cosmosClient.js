const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || "insighthub";
const containerId = "research"; // Single container for all data

console.log('Cosmos DB Configuration:');
console.log('  Endpoint:', endpoint);
console.log('  Key:', key ? '✓ Set' : '✗ Missing');
console.log('  Database:', databaseId);
console.log('  Container:', containerId);

if (!endpoint || !key) {
  console.error("Missing Cosmos DB configuration!");
  throw new Error("Cosmos DB configuration missing. Set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.");
}

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

/**
 * Get the research container
 * @returns {Container} - The CosmosDB container
 */
function getContainer() {
  return container;
}

// ============================================
// Key-Value Style API (mirrors Supabase pattern)
// ============================================

/**
 * Get a document by its Supabase-style key
 * @param {string} key - The original key (e.g., "projects:list", "research:hypotheses")
 * @returns {Promise<any>} - The document data
 */
async function getValue(key) {
  const { docId, partitionKey } = keyToDocId(key);
  
  try {
    const { resource } = await container.item(docId, partitionKey).read();
    
    if (!resource) return null;
    
    // Return the data in the expected format
    if (resource.projects) return resource.projects;
    if (resource.data) return resource.data;
    return resource;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

/**
 * Set a document by its Supabase-style key
 * @param {string} key - The original key (e.g., "projects:list")
 * @param {any} value - The data to store
 * @returns {Promise<void>}
 */
async function setValue(key, value) {
  const { docId, partitionKey, type } = keyToDocId(key);
  
  const document = {
    id: docId,
    projectId: partitionKey,
    type: type,
    _updatedAt: new Date().toISOString()
  };
  
  // Store projects at top level, other data in 'data' field
  if (key === 'projects:list') {
    document.projects = value;
  } else {
    document.data = value;
  }
  
  await container.items.upsert(document);
}

/**
 * Convert Supabase-style key to CosmosDB document ID and partition key
 * @param {string} key - e.g., "projects:list", "synthesis:proj_123:hypotheses"
 * @returns {{ docId: string, partitionKey: string, type: string }}
 */
function keyToDocId(key) {
  const parts = key.split(':');
  
  if (key === 'projects:list') {
    return { docId: 'projects_list', partitionKey: 'global', type: 'projects' };
  }
  
  if (key.startsWith('research:')) {
    const type = parts[1];
    return { docId: `research_${type}`, partitionKey: 'global', type };
  }
  
  if (key.startsWith('synthesis:')) {
    const projectId = parts[1];
    const type = parts[2];
    return { 
      docId: `${projectId}_synthesis_${type}`, 
      partitionKey: projectId, 
      type: `synthesis_${type}` 
    };
  }
  
  // Fallback
  return { docId: key.replace(/:/g, '_'), partitionKey: 'global', type: parts[0] };
}

// ============================================
// Direct Document API
// ============================================

/**
 * Get a document by ID
 * @param {string} docId - Document ID
 * @param {string} partitionKey - Partition key value
 * @returns {Promise<any>}
 */
async function getDocument(docId, partitionKey) {
  try {
    const { resource } = await container.item(docId, partitionKey).read();
    return resource;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

/**
 * Upsert a document
 * @param {object} document - Document with id and projectId
 * @returns {Promise<any>}
 */
async function upsertDocument(document) {
  const { resource } = await container.items.upsert(document);
  return resource;
}

/**
 * Query documents by type
 * @param {string} type - Document type (e.g., "projects", "hypotheses")
 * @returns {Promise<any[]>}
 */
async function queryByType(type) {
  const { resources } = await container.items
    .query({
      query: "SELECT * FROM c WHERE c.type = @type",
      parameters: [{ name: "@type", value: type }]
    })
    .fetchAll();
  return resources;
}

/**
 * Query documents by project
 * @param {string} projectId - Project ID
 * @returns {Promise<any[]>}
 */
async function queryByProject(projectId) {
  const { resources } = await container.items
    .query({
      query: "SELECT * FROM c WHERE c.projectId = @projectId",
      parameters: [{ name: "@projectId", value: projectId }]
    })
    .fetchAll();
  return resources;
}

// ============================================
// Auth Helpers (unchanged)
// ============================================

/**
 * Extract tenant ID from Azure AD token (for multi-tenancy)
 */
function extractTenantId(req) {
  const clientPrincipal = req.headers['x-ms-client-principal'];
  
  if (clientPrincipal) {
    try {
      const decoded = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('utf8'));
      const tenantClaim = decoded.claims?.find(c => 
        c.typ === 'tid' || c.typ === 'http://schemas.microsoft.com/identity/claims/tenantid'
      );
      return tenantClaim?.val || null;
    } catch (error) {
      console.error('Error decoding client principal:', error);
    }
  }
  return null;
}

/**
 * Extract user info from Azure AD token
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
  // Container access
  getContainer,
  container,
  client, 
  databaseId,
  
  // Key-value API (Supabase-compatible)
  getValue,
  setValue,
  
  // Direct document API
  getDocument,
  upsertDocument,
  queryByType,
  queryByProject,
  
  // Auth helpers
  extractTenantId,
  extractUserInfo
};