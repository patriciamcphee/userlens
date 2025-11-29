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
    
    // Fetch existing to check access
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
    
    await container.item(participantId, participantId).delete();
    
    context.log(`Deleted participant: ${participantId}`);
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { success: true, message: "Participant deleted successfully" }
    };
  } catch (error) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Participant not found" }
      };
      return;
    }
    
    context.log.error("Error deleting participant:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to delete participant", message: error.message }
    };
  }
};
