const { getContainer, extractTenantId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const { projectId } = context.bindingData;
    
    if (!projectId) {
      context.res = {
        status: 400,
        body: { error: "Project ID is required" }
      };
      return;
    }
    
    const container = await getContainer("projects");
    const tenantId = extractTenantId(req);
    
    // Fetch the project by ID
    const { resource: project } = await container.item(projectId, projectId).read();
    
    if (!project) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }
    
    // Check tenant access if multi-tenancy is enabled
    if (tenantId && project.tenantId && project.tenantId !== tenantId) {
      context.res = {
        status: 403,
        body: { error: "Access denied to this project" }
      };
      return;
    }
    
    context.log(`Fetched project: ${projectId}`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: project
    };
  } catch (error) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }
    
    context.log.error("Error fetching project:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch project", message: error.message }
    };
  }
};
