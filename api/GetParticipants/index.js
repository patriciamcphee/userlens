const { getContainer, extractTenantId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const container = await getContainer("participants");
    const tenantId = extractTenantId(req);
    
    // Optional: filter by project
    const projectId = req.query.projectId;
    
    let querySpec;
    const parameters = [];
    let whereClause = [];
    
    if (tenantId) {
      whereClause.push("c.tenantId = @tenantId");
      parameters.push({ name: "@tenantId", value: tenantId });
    }
    
    if (projectId) {
      whereClause.push("c.projectId = @projectId");
      parameters.push({ name: "@projectId", value: projectId });
    }
    
    if (whereClause.length > 0) {
      querySpec = {
        query: `SELECT * FROM c WHERE ${whereClause.join(" AND ")} ORDER BY c.createdAt DESC`,
        parameters
      };
    } else {
      querySpec = {
        query: "SELECT * FROM c ORDER BY c.createdAt DESC"
      };
    }
    
    const { resources: participants } = await container.items.query(querySpec).fetchAll();
    
    context.log(`Found ${participants.length} participants`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { participants }
    };
  } catch (error) {
    context.log.error("Error fetching participants:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch participants", message: error.message }
    };
  }
};
