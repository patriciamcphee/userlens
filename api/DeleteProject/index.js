const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const projectId = req.params.id;
    const container = await getContainer("projects");
    
    await container.item(projectId, projectId).delete();
    
    context.res = {
      status: 204
    };
  } catch (error) {
    context.log.error("Error deleting project:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to delete project", message: error.message }
    };
  }
};