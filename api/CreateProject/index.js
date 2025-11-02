const { getContainer } = require("../cosmosClient");

module.exports = async function (context, req) {
  context.log('CreateProject function triggered');
  
  try {
    // Log the incoming request
    context.log('Request body:', JSON.stringify(req.body));
    
    if (!req.body) {
      context.log.error('No request body provided');
      context.res = {
        status: 400,
        body: { error: "Request body is required" }
      };
      return;
    }

    // Validate required fields
    if (!req.body.name) {
      context.log.error('Missing required field: name');
      context.res = {
        status: 400,
        body: { error: "Project name is required" }
      };
      return;
    }

    context.log('Getting Projects container...');
    const container = await getContainer("projects");
    
    // Convert numeric ID to string for Cosmos DB
    const project = {
      ...req.body,
      id: String(req.body.id), // Cosmos DB requires string IDs
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    context.log('Creating project in Cosmos DB:', JSON.stringify(project));
    const { resource } = await container.items.create(project);
    
    context.log('Project created successfully:', resource.id);
    
    context.res = {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      },
      body: resource
    };
  } catch (error) {
    context.log.error("Error creating project:", error);
    context.log.error("Error stack:", error.stack);
    context.res = {
      status: 500,
      body: { 
        error: "Failed to create project", 
        message: error.message,
        details: error.toString()
      }
    };
  }
};