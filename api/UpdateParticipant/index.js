const { getContainer, extractTenantId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const { participantId } = context.bindingData;
    const updates = req.body;
    
    if (!participantId) {
      context.res = {
        status: 400,
        body: { error: "Participant ID is required" }
      };
      return;
    }
    
    const container = await getContainer("participants");
    const tenantId = extractTenantId(req);
    
    // Fetch existing
    const { resource: existing } = await container.item(participantId, participantId).read();
    
    if (!existing) {
      context.res = {
        status: 404,
        body: { error: "Participant not found" }
      };
      return;
    }
    
    // Check tenant access
    if (tenantId && existing.tenantId && existing.tenantId !== tenantId) {
      context.res = {
        status: 403,
        body: { error: "Access denied to this participant" }
      };
      return;
    }
    
    const updatedParticipant = {
      ...existing,
      ...updates,
      id: participantId,
      tenantId: existing.tenantId,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    const { resource: result } = await container.item(participantId, participantId).replace(updatedParticipant);
    
    context.log(`Updated participant: ${participantId}`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: result
    };
  } catch (error) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Participant not found" }
      };
      return;
    }
    
    context.log.error("Error updating participant:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to update participant", message: error.message }
    };
  }
};
