const { getContainer, extractTenantId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const { participantId } = context.bindingData;
    
    if (!participantId) {
      context.res = {
        status: 400,
        body: { error: "Participant ID is required" }
      };
      return;
    }
    
    const container = await getContainer("participants");
    const tenantId = extractTenantId(req);
    
    const { resource: participant } = await container.item(participantId, participantId).read();
    
    if (!participant) {
      context.res = {
        status: 404,
        body: { error: "Participant not found" }
      };
      return;
    }
    
    // Check tenant access
    if (tenantId && participant.tenantId && participant.tenantId !== tenantId) {
      context.res = {
        status: 403,
        body: { error: "Access denied to this participant" }
      };
      return;
    }
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: participant
    };
  } catch (error) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Participant not found" }
      };
      return;
    }
    
    context.log.error("Error fetching participant:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch participant", message: error.message }
    };
  }
};
