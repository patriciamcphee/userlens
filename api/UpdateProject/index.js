const { getContainer, extractTenantId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const { projectId } = context.bindingData;
    const updates = req.body;
    
    if (!projectId) {
      context.res = {
        status: 400,
        body: { error: "Project ID is required" }
      };
      return;
    }
    
    const container = await getContainer("projects");
    const tenantId = extractTenantId(req);
    
    // Fetch existing project
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
    
    // Merge updates with existing project
    const updatedProject = {
      ...existing,
      ...updates,
      id: projectId, // Ensure ID doesn't change
      tenantId: existing.tenantId, // Preserve tenant
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    const { resource: result } = await container.item(projectId, projectId).replace(updatedProject);
    
    context.log(`Updated project: ${projectId}`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: result
    };
  } catch (error) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }
    
    context.log.error("Error updating project:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to update project", message: error.message }
    };
  }
};
