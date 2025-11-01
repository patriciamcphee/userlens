const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const participantId = req.params.id;
    const container = await getContainer("Participants");
    
    await container.item(participantId, participantId).delete();
    
    context.res = {
      status: 204
    };
  } catch (error) {
    context.log.error("Error deleting participant:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to delete participant", message: error.message }
    };
  }
};