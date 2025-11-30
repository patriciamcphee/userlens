/**
 * Research API Handler
 * 
 * Unified handler for global research data (not project-scoped).
 * 
 * Routes:
 *   GET/POST   /api/research/hypotheses
 *   PUT/DELETE /api/research/hypotheses/{id}
 *   
 *   GET/POST   /api/research/participants
 *   PUT/DELETE /api/research/participants/{id}
 *   
 *   GET/POST   /api/research/questions
 *   PUT/DELETE /api/research/questions/{id}
 *   
 *   GET/POST   /api/research/notes
 *   PUT/DELETE /api/research/notes/{id}
 *   GET        /api/research/notes/clusters
 */

const { 
  hypotheses, 
  participants, 
  researchQuestions, 
  stickyNotes 
} = require("../cosmosService");

// Map resource names to service modules
const services = {
  hypotheses,
  participants,
  questions: researchQuestions,
  notes: stickyNotes
};

module.exports = async function (context, req) {
  const method = req.method.toUpperCase();
  const resource = context.bindingData.resource;  // hypotheses, participants, questions, notes
  const itemId = context.bindingData.itemId;      // optional item ID
  const subRoute = context.bindingData.subRoute;  // optional sub-route like "clusters"
  
  try {
    // Validate resource
    const service = services[resource];
    if (!service) {
      return respond(context, 404, { 
        error: `Unknown resource: ${resource}`,
        validResources: Object.keys(services)
      });
    }
    
    // Special routes
    if (resource === 'notes' && subRoute === 'clusters') {
      const clusters = await stickyNotes.getClusters();
      return respond(context, 200, { clusters });
    }
    
    // GET collection
    if (method === 'GET' && !itemId) {
      const items = await service.getAll();
      return respond(context, 200, { [resource]: items });
    }
    
    // POST - create new item
    if (method === 'POST' && !itemId) {
      const data = req.body;
      if (!data) {
        return respond(context, 400, { error: "Request body is required" });
      }
      
      const created = await service.create(data);
      return respond(context, 201, created);
    }
    
    // GET single item
    if (method === 'GET' && itemId) {
      if (typeof service.getById === 'function') {
        const item = await service.getById(itemId);
        if (!item) {
          return respond(context, 404, { error: `${resource} not found: ${itemId}` });
        }
        return respond(context, 200, item);
      }
      
      // Fallback: get all and filter
      const items = await service.getAll();
      const item = items.find(i => i.id === itemId);
      if (!item) {
        return respond(context, 404, { error: `${resource} not found: ${itemId}` });
      }
      return respond(context, 200, item);
    }
    
    // PUT/PATCH - update item
    if ((method === 'PUT' || method === 'PATCH') && itemId) {
      const updates = req.body;
      if (!updates) {
        return respond(context, 400, { error: "Update data is required" });
      }
      
      try {
        const updated = await service.update(itemId, updates);
        return respond(context, 200, updated);
      } catch (error) {
        if (error.message.includes('not found')) {
          return respond(context, 404, { error: `${resource} not found: ${itemId}` });
        }
        throw error;
      }
    }
    
    // DELETE - remove item
    if (method === 'DELETE' && itemId) {
      try {
        await service.delete(itemId);
        return respond(context, 200, { success: true, message: `${resource} deleted` });
      } catch (error) {
        if (error.message.includes('not found')) {
          return respond(context, 404, { error: `${resource} not found: ${itemId}` });
        }
        throw error;
      }
    }
    
    // Method not allowed
    return respond(context, 405, { error: "Method not allowed" });
    
  } catch (error) {
    context.log.error("Research API error:", error);
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
