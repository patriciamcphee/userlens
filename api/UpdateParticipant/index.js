const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const participantId = req.params.id;
    
    if (!req.body) {
      context.res = {
        status: 400,
        body: { error: "Request body is required" }
      };
      return;
    }

    const container = await getContainer("participants");
    
    const { resource: existingParticipant } = await container.item(participantId, participantId).read();
    
    if (!existingParticipant) {
      context.res = {
        status: 404,
        body: { error: "Participant not found" }
      };
      return;
    }

    const updatedParticipant = {
      ...existingParticipant,
      ...req.body,
      id: participantId,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.item(participantId, participantId).replace(updatedParticipant);
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: resource
    };
  } catch (error) {
    context.log.error("Error updating participant:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to update participant", message: error.message }
    };
  }
};