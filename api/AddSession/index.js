const { getContainer, extractTenantId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const { projectId } = context.bindingData;
    const sessionData = req.body;
    
    if (!projectId) {
      context.res = {
        status: 400,
        body: { error: "Project ID is required" }
      };
      return;
    }
    
    if (!sessionData) {
      context.res = {
        status: 400,
        body: { error: "Session data is required" }
      };
      return;
    }
    
    const container = await getContainer("projects");
    const tenantId = extractTenantId(req);
    
    // Fetch the project
    const { resource: project } = await container.item(projectId, projectId).read();
    
    if (!project) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }
    
    // Check tenant access
    if (tenantId && project.tenantId && project.tenantId !== tenantId) {
      context.res = {
        status: 403,
        body: { error: "Access denied to this project" }
      };
      return;
    }
    
    // Initialize sessions array if needed
    if (!project.sessions) {
      project.sessions = [];
    }
    
    // Create new session
    const now = new Date().toISOString();
    const newSession = {
      id: sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...sessionData,
      createdAt: now,
      completedAt: sessionData.completedAt || now
    };
    
    project.sessions.push(newSession);
    
    // Update session counts
    project.totalSessions = project.sessions.length;
    project.completedSessions = project.sessions.filter(s => s.completedAt).length;
    project.updatedAt = now;
    
    // Save updated project
    const { resource: updated } = await container.item(projectId, projectId).replace(project);
    
    context.log(`Added session to project: ${projectId}`);
    
    context.res = {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: updated
    };
  } catch (error) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }
    
    context.log.error("Error adding session:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to add session", message: error.message }
    };
  }
};
