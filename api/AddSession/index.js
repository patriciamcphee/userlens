const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const projectId = req.params.projectId;
    
    if (!req.body) {
      context.res = {
        status: 400,
        body: { error: "Request body is required" }
      };
      return;
    }

    const container = await getContainer("projects");
    
    // Fetch existing project
    const { resource: project } = await container.item(projectId, projectId).read();
    
    if (!project) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }

    // Add session to project
    const updatedProject = {
      ...project,
      sessions: [...(project.sessions || []), req.body],
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.item(projectId, projectId).replace(updatedProject);
    
    context.res = {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      },
      body: resource
    };
  } catch (error) {
    context.log.error("Error adding session:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to add session", message: error.message }
    };
  }
};