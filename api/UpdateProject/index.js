const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const projectId = req.params.id;
    
    if (!req.body) {
      context.res = {
        status: 400,
        body: { error: "Request body is required" }
      };
      return;
    }

    const container = await getContainer("projects");
    
    // Fetch existing project
    const { resource: existingProject } = await container.item(projectId, projectId).read();
    
    if (!existingProject) {
      context.res = {
        status: 404,
        body: { error: "Project not found" }
      };
      return;
    }

    // Merge updates
    const updatedProject = {
      ...existingProject,
      ...req.body,
      id: projectId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.item(projectId, projectId).replace(updatedProject);
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: resource
    };
  } catch (error) {
    context.log.error("Error updating project:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to update project", message: error.message }
    };
  }
};