/**
 * Synthesis API Handler
 * 
 * Project-scoped synthesis data (hypotheses, notes, clusters per project).
 * 
 * Routes:
 *   GET    /api/synthesis/{projectId}                    - Get all synthesis data for project
 *   POST   /api/synthesis/{projectId}/initialize         - Initialize synthesis for project
 *   
 *   GET    /api/synthesis/{projectId}/{type}             - Get specific type (hypotheses, notes, clusters)
 *   POST   /api/synthesis/{projectId}/{type}             - Add item to type
 *   PUT    /api/synthesis/{projectId}/{type}/{itemId}    - Update item
 *   DELETE /api/synthesis/{projectId}/{type}/{itemId}    - Delete item
 */

const { synthesis, projects } = require("../cosmosService");

module.exports = async function (context, req) {
  const method = req.method.toUpperCase();
  const projectId = context.bindingData.projectId;
  const type = context.bindingData.type;        // hypotheses, notes, clusters, questions
  const itemId = context.bindingData.itemId;
  
  if (!projectId) {
    return respond(context, 400, { error: "Project ID is required" });
  }
  
  try {
    // Verify project exists
    const project = await projects.getById(projectId);
    if (!project) {
      return respond(context, 404, { error: `Project not found: ${projectId}` });
    }
    
    // POST /api/synthesis/{projectId}/initialize
    if (method === 'POST' && type === 'initialize') {
      await synthesis.initialize(projectId);
      return respond(context, 201, { 
        success: true, 
        message: "Synthesis initialized",
        projectId 
      });
    }
    
    // GET /api/synthesis/{projectId} - get all synthesis data
    if (method === 'GET' && !type) {
      const [hypotheses, notes, clusters, questions] = await Promise.all([
        synthesis.get(projectId, 'hypotheses'),
        synthesis.get(projectId, 'notes'),
        synthesis.get(projectId, 'clusters'),
        synthesis.get(projectId, 'questions')
      ]);
      
      return respond(context, 200, {
        projectId,
        hypotheses,
        notes,
        clusters,
        questions
      });
    }
    
    // Validate type
    const validTypes = ['hypotheses', 'notes', 'clusters', 'questions'];
    if (type && !validTypes.includes(type)) {
      return respond(context, 400, { 
        error: `Invalid type: ${type}`,
        validTypes 
      });
    }
    
    // GET /api/synthesis/{projectId}/{type}
    if (method === 'GET' && type) {
      const data = await synthesis.get(projectId, type);
      return respond(context, 200, { [type]: data });
    }
    
    // POST /api/synthesis/{projectId}/{type}
    if (method === 'POST' && type && !itemId) {
      const itemData = req.body;
      if (!itemData) {
        return respond(context, 400, { error: "Item data is required" });
      }
      
      const created = await synthesis.addItem(projectId, type, itemData);
      return respond(context, 201, created);
    }
    
    // PUT /api/synthesis/{projectId}/{type}/{itemId}
    if ((method === 'PUT' || method === 'PATCH') && type && itemId) {
      const updates = req.body;
      if (!updates) {
        return respond(context, 400, { error: "Update data is required" });
      }
      
      try {
        const updated = await synthesis.updateItem(projectId, type, itemId, updates);
        return respond(context, 200, updated);
      } catch (error) {
        if (error.message.includes('not found')) {
          return respond(context, 404, { error: `${type} item not found: ${itemId}` });
        }
        throw error;
      }
    }
    
    // DELETE /api/synthesis/{projectId}/{type}/{itemId}
    if (method === 'DELETE' && type && itemId) {
      try {
        await synthesis.deleteItem(projectId, type, itemId);
        return respond(context, 200, { success: true, message: `${type} item deleted` });
      } catch (error) {
        if (error.message.includes('not found')) {
          return respond(context, 404, { error: `${type} item not found: ${itemId}` });
        }
        throw error;
      }
    }
    
    return respond(context, 405, { error: "Method not allowed" });
    
  } catch (error) {
    context.log.error("Synthesis API error:", error);
    return respond(context, 500, { 
      error: "Internal server error", 
      message: error.message 
    });
  }
};

function respond(context, status, body) {
  context.res = {
    status,
    headers: { "Content-Type": "application/json" },
    body
  };
}
