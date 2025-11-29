const { getContainer, extractTenantId, extractUserInfo } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const projectData = req.body;
    
    if (!projectData || !projectData.name) {
      context.res = {
        status: 400,
        body: { error: "Project name is required" }
      };
      return;
    }
    
    const container = await getContainer("projects");
    const tenantId = extractTenantId(req);
    const userInfo = extractUserInfo(req);
    
    const now = new Date().toISOString();
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newProject = {
      id: projectId,
      ...projectData,
      // Multi-tenancy fields
      tenantId: tenantId || null,
      createdBy: userInfo?.userId || null,
      createdByEmail: userInfo?.userDetails || null,
      // Timestamps
      createdAt: now,
      updatedAt: now,
      // Default values
      status: projectData.status || 'active',
      participants: projectData.participants || [],
      tasks: projectData.tasks || [],
      sessions: projectData.sessions || [],
      totalSessions: 0,
      completedSessions: 0
    };
    
    const { resource: created } = await container.items.create(newProject);
    
    context.log(`Created project: ${projectId} for tenant: ${tenantId}`);
    
    context.res = {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: created
    };
  } catch (error) {
    context.log.error("Error creating project:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to create project", message: error.message }
    };
  }
};
