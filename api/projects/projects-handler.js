/**
 * Projects API Handler
 * 
 * Unified handler for all project operations using cosmosService.
 * 
 * Routes:
 *   GET    /api/projects           - List all projects
 *   POST   /api/projects           - Create a project
 *   GET    /api/projects/{id}      - Get single project
 *   PUT    /api/projects/{id}      - Update a project
 *   DELETE /api/projects/{id}      - Delete a project
 *   POST   /api/projects/{id}/sessions - Add session to project
 */

const { projects, extractTenantId } = require("../cosmosService");

module.exports = async function (context, req) {
  const method = req.method.toUpperCase();
  const projectId = context.bindingData.projectId;
  const isSessionRoute = context.bindingData.route?.includes('/sessions');
  
  try {
    // POST /api/projects/{projectId}/sessions
    if (method === 'POST' && projectId && isSessionRoute) {
      const session = req.body;
      if (!session) {
        return respond(context, 400, { error: "Session data is required" });
      }
      
      const updated = await projects.addSession(projectId, session);
      return respond(context, 201, updated);
    }
    
    // GET /api/projects
    if (method === 'GET' && !projectId) {
      const allProjects = await projects.getAll();
      
      // Optional: filter by tenant if multi-tenancy is enabled
      const tenantId = extractTenantId(req);
      const filtered = tenantId 
        ? allProjects.filter(p => !p.tenantId || p.tenantId === tenantId)
        : allProjects;
      
      return respond(context, 200, { projects: filtered });
    }
    
    // POST /api/projects
    if (method === 'POST' && !projectId) {
      const projectData = req.body;
      if (!projectData?.name) {
        return respond(context, 400, { error: "Project name is required" });
      }
      
      const tenantId = extractTenantId(req);
      const created = await projects.create({
        ...projectData,
        tenantId: tenantId || null
      });
      
      return respond(context, 201, created);
    }
    
    // GET /api/projects/{projectId}
    if (method === 'GET' && projectId) {
      const project = await projects.getById(projectId);
      
      if (!project) {
        return respond(context, 404, { error: "Project not found" });
      }
      
      // Check tenant access
      const tenantId = extractTenantId(req);
      if (tenantId && project.tenantId && project.tenantId !== tenantId) {
        return respond(context, 403, { error: "Access denied" });
      }
      
      return respond(context, 200, project);
    }
    
    // PUT /api/projects/{projectId}
    if ((method === 'PUT' || method === 'PATCH') && projectId) {
      const updates = req.body;
      if (!updates) {
        return respond(context, 400, { error: "Update data is required" });
      }
      
      try {
        const updated = await projects.update(projectId, updates);
        return respond(context, 200, updated);
      } catch (error) {
        if (error.message.includes('not found')) {
          return respond(context, 404, { error: "Project not found" });
        }
        throw error;
      }
    }
    
    // DELETE /api/projects/{projectId}
    if (method === 'DELETE' && projectId) {
      try {
        await projects.delete(projectId);
        return respond(context, 200, { success: true, message: "Project deleted" });
      } catch (error) {
        if (error.message.includes('not found')) {
          return respond(context, 404, { error: "Project not found" });
        }
        throw error;
      }
    }
    
    // Method not allowed
    return respond(context, 405, { error: "Method not allowed" });
    
  } catch (error) {
    context.log.error("Projects API error:", error);
    return respond(context, 500, { 
      error: "Internal server error", 
      message: error.message 
    });
  }
};

function respond(context, status, body) {
  context.res = {
    status,
    headers: { "Content-Type": "application/json" },
    body
  };
}
