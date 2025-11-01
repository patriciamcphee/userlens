const { client, databaseId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    // Create database if not exists
    const { database } = await client.databases.createIfNotExists({
      id: databaseId
    });

    context.log(`Database ${databaseId} ready`);

    // Create Projects container if not exists
    const { container: projectsContainer } = await database.containers.createIfNotExists({
      id: "Projects",
      partitionKey: { paths: ["/id"] }
    });

    context.log("Projects container ready");

    // Create Participants container if not exists
    const { container: participantsContainer } = await database.containers.createIfNotExists({
      id: "Participants",
      partitionKey: { paths: ["/id"] }
    });

    context.log("Participants container ready");

    context.res = {
      status: 200,
      body: {
        message: "Database and containers initialized successfully",
        database: databaseId,
        containers: ["Projects", "Participants"]
      }
    };
  } catch (error) {
    context.log.error("Error initializing database:", error);
    context.res = {
      status: 500,
      body: { 
        error: "Failed to initialize database", 
        message: error.message,
        details: error.toString()
      }
    };
  }
};