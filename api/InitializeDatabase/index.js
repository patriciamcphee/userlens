const { client, databaseId } = require("../cosmosClient");

module.exports = async function (context, req) {
  try {
    context.log("Initializing database...");
    
    // Create database if not exists
    const { database } = await client.databases.createIfNotExists({
      id: databaseId
    });
    
    context.log(`Database "${databaseId}" ready`);
    
    // Create containers with appropriate partition keys
    const containers = [
      {
        id: "projects",
        partitionKey: { paths: ["/id"] }
      },
      {
        id: "participants", 
        partitionKey: { paths: ["/id"] }
      },
      {
        id: "synthesis",
        partitionKey: { paths: ["/projectId"] }
      }
    ];
    
    const createdContainers = [];
    
    for (const containerConfig of containers) {
      const { container } = await database.containers.createIfNotExists(containerConfig);
      context.log(`Container "${containerConfig.id}" ready`);
      createdContainers.push(containerConfig.id);
    }
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        success: true,
        message: "Database and containers initialized successfully",
        database: databaseId,
        containers: createdContainers
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
