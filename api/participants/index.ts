import { InvocationContext, HttpRequest, HttpResponseInit } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_KEY!
});

const database = client.database(process.env.COSMOS_DB_DATABASE!);
const container = database.container(process.env.COSMOS_DB_CONTAINER_PROJECTS!);

const httpTrigger = async function (
  context: InvocationContext,
  req: HttpRequest
): Promise<HttpResponseInit> {
  const id = req.params.id;
  const method = req.method;

  try {
    switch (method) {
      case "GET":
        if (id) {
          // Get single project
          const { resource } = await container.item(id, id).read();
          return {
            status: 200,
            jsonBody: resource
          };
        } else {
          // Get all projects
          const { resources } = await container.items
            .query("SELECT * FROM c")
            .fetchAll();
          return {
            status: 200,
            jsonBody: resources
          };
        }
        break;

      case "POST":
        // Create project
        const newProject = req.body as any;
        if (!newProject) {
          return {
            status: 400,
            jsonBody: { error: "Request body required" }
          };
        }
        newProject.id = newProject.id || Date.now().toString();
        newProject.id = newProject.id || Date.now().toString();
        newProject.createdAt = new Date().toISOString();
        newProject.updatedAt = new Date().toISOString();
        
        const { resource: created } = await container.items.create(newProject);
        return {
          status: 201,
          jsonBody: created
        };
      case "PUT":
        // Update project
        if (!id) {
          return {
            status: 400,
            jsonBody: { error: "Project ID required" }
          };
        }
        
        const updates = req.body as any;
        updates.updatedAt = new Date().toISOString();
        
        const { resource: existing } = await container.item(id, id).read();
        const updated = { ...existing, ...updates };
        
        const { resource: result } = await container
          .item(id, id)
          .replace(updated);
        
        return {
          status: 200,
          jsonBody: result
        };

      case "DELETE":
        // Delete project
        if (!id) {
          return {
            status: 400,
            jsonBody: { error: "Project ID required" }
          };
        }
        
        await container.item(id, id).delete();
      await container.item(id, id).delete();
      return {
        status: 204
      };

    default:
        return {
          status: 405,
          jsonBody: { error: "Method not allowed" }
        };
    }
  } catch (error: any) {
    context.error("Error:", error);
    return {
      status: error.code === 404 ? 404 : 500,
      jsonBody: { error: error.message || "Internal server error" }
    };
  }
};
