const { getContainer, extractTenantId, extractUserInfo } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const participantData = req.body;
    
    if (!participantData || !participantData.name) {
      context.res = {
        status: 400,
        body: { error: "Participant name is required" }
      };
      return;
    }
    
    const container = await getContainer("participants");
    const tenantId = extractTenantId(req);
    const userInfo = extractUserInfo(req);
    
    const now = new Date().toISOString();
    const participantId = `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newParticipant = {
      id: participantId,
      ...participantData,
      // Multi-tenancy
      tenantId: tenantId || null,
      createdBy: userInfo?.userId || null,
      // Timestamps
      createdAt: now,
      updatedAt: now,
      addedAt: now,
      // Defaults
      status: participantData.status || 'invited',
      usageLevel: participantData.usageLevel || 'occasional',
      sessionHistory: []
    };
    
    const { resource: created } = await container.items.create(newParticipant);
    
    context.log(`Created participant: ${participantId}`);
    
    context.res = {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: created
    };
  } catch (error) {
    context.log.error("Error creating participant:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to create participant", message: error.message }
    };
  }
};
