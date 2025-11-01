const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    const container = await getContainer("Projects");
    
    const { resources: projects } = await container.items
      .query({
        query: "SELECT * FROM c ORDER BY c._ts DESC"
      })
      .fetchAll();
    
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: projects
    };
  } catch (error) {
    context.log.error("Error fetching projects:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch projects", message: error.message }
    };
  }
};