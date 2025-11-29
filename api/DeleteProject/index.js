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
    
    // Fetch existing project to check access
    const { resource: existing } = await container.item(projectId, projectId).read();
    
    if (!existing) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }
    
    // Check tenant access
    if (tenantId && existing.tenantId && existing.tenantId !== tenantId) {
      context.res = {
        status: 403,
        body: { error: "Access denied to this project" }
      };
      return;
    }
    
    // Delete the project
    await container.item(projectId, projectId).delete();
    
    context.log(`Deleted project: ${projectId}`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { success: true, message: "Project deleted successfully" }
    };
  } catch (error) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }
    
    context.log.error("Error deleting project:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to delete project", message: error.message }
    };
  }
};
