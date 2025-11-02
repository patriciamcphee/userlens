const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    if (!req.body) {
      context.res = {
        status: 400,
        body: { error: "Request body is required" }
      };
      return;
    }

    const container = await getContainer("participants");
    const participant = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await container.items.create(participant);
    
    context.res = {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      },
      body: resource
    };
  } catch (error) {
    context.log.error("Error creating participant:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to create participant", message: error.message }
    };
  }
};