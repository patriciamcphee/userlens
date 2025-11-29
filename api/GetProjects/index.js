const { getContainer, extractTenantId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const container = await getContainer("projects");
    const tenantId = extractTenantId(req);
    
    let querySpec;
    
    if (tenantId) {
      // Multi-tenant: filter by organization
      querySpec = {
        query: "SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.updatedAt DESC",
        parameters: [{ name: "@tenantId", value: tenantId }]
      };
      context.log(`Fetching projects for tenant: ${tenantId}`);
    } else {
      // No tenant filter (development or anonymous access)
      querySpec = {
        query: "SELECT * FROM c ORDER BY c.updatedAt DESC"
      };
      context.log("Fetching all projects (no tenant filter)");
    }
    
    const { resources: projects } = await container.items.query(querySpec).fetchAll();
    
    context.log(`Found ${projects.length} projects`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { projects }
    };
  } catch (error) {
    context.log.error("Error fetching projects:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch projects", message: error.message }
    };
  }
};
