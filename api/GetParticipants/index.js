const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const container = await getContainer("Participants");
    
    const { resources: participants } = await container.items
      .query({
        query: "SELECT * FROM c ORDER BY c.name ASC"
      })
      .fetchAll();
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: participants
    };
  } catch (error) {
    context.log.error("Error fetching participants:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch participants", message: error.message }
    };
  }
};