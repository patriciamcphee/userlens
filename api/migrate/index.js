/**
 * Migration API Handler
 * 
 * One-time migration utilities for copying global research data to project-specific synthesis.
 * 
 * Routes:
 *   POST /api/migrate/{projectId}/from-global    - Copy global research data to project synthesis
 *   GET  /api/migrate/global-data                - View what's in global research data
 */

const { 
  synthesis,
  projects,
  hypotheses: globalHypotheses,
  researchQuestions: globalResearchQuestions,
  stickyNotes: globalStickyNotes
} = require("../cosmosService");

module.exports = async function (context, req) {
  const method = req.method.toUpperCase();
  const projectId = context.bindingData.projectId;
  const action = context.bindingData.action;
  
  try {
    // GET /api/migrate/global-data - Preview what's in global storage
    if (method === 'GET' && projectId === 'global-data') {
      const [hypotheses, questions, notes] = await Promise.all([
        globalHypotheses.getAll(),
        globalResearchQuestions.getAll(),
        globalStickyNotes.getAll()
      ]);
      
      return respond(context, 200, {
        message: "Global research data (not project-scoped)",
        hypotheses: {
          count: hypotheses.length,
          items: hypotheses
        },
        questions: {
          count: questions.length,
          items: questions
        },
        notes: {
          count: notes.length,
          items: notes
        }
      });
    }
    
    // POST /api/migrate/{projectId}/from-global - Copy global data to project
    if (method === 'POST' && action === 'from-global') {
      // Verify project exists
      const project = await projects.getById(projectId);
      if (!project) {
        return respond(context, 404, { error: `Project not found: ${projectId}` });
      }
      
      // Get existing project synthesis data
      const [existingHypotheses, existingQuestions, existingNotes] = await Promise.all([
        synthesis.get(projectId, 'hypotheses'),
        synthesis.get(projectId, 'questions'),
        synthesis.get(projectId, 'notes')
      ]);
      
      // Check if project already has data
      const hasExistingData = existingHypotheses.length > 0 || 
                              existingQuestions.length > 0 || 
                              existingNotes.length > 0;
      
      // Get query param to force overwrite
      const forceOverwrite = req.query.force === 'true';
      
      if (hasExistingData && !forceOverwrite) {
        return respond(context, 400, {
          error: "Project already has synthesis data",
          existing: {
            hypotheses: existingHypotheses.length,
            questions: existingQuestions.length,
            notes: existingNotes.length
          },
          hint: "Add ?force=true to overwrite existing data, or choose a different project"
        });
      }
      
      // Get global data
      const [globalH, globalQ, globalN] = await Promise.all([
        globalHypotheses.getAll(),
        globalResearchQuestions.getAll(),
        globalStickyNotes.getAll()
      ]);
      
      if (globalH.length === 0 && globalQ.length === 0 && globalN.length === 0) {
        return respond(context, 400, {
          error: "No global research data to migrate",
          hint: "Global research data is empty"
        });
      }
      
      // Copy to project synthesis
      const results = {
        hypotheses: { copied: 0, items: [] },
        questions: { copied: 0, items: [] },
        notes: { copied: 0, items: [] }
      };
      
      // Copy hypotheses
      if (globalH.length > 0) {
        for (const h of globalH) {
          const copied = await synthesis.addItem(projectId, 'hypotheses', {
            ...h,
            _migratedFrom: 'global',
            _migratedAt: new Date().toISOString()
          });
          results.hypotheses.items.push(copied.id);
        }
        results.hypotheses.copied = globalH.length;
      }
      
      // Copy questions
      if (globalQ.length > 0) {
        for (const q of globalQ) {
          const copied = await synthesis.addItem(projectId, 'questions', {
            ...q,
            _migratedFrom: 'global',
            _migratedAt: new Date().toISOString()
          });
          results.questions.items.push(copied.id);
        }
        results.questions.copied = globalQ.length;
      }
      
      // Copy notes
      if (globalN.length > 0) {
        for (const n of globalN) {
          const copied = await synthesis.addItem(projectId, 'notes', {
            ...n,
            _migratedFrom: 'global',
            _migratedAt: new Date().toISOString()
          });
          results.notes.items.push(copied.id);
        }
        results.notes.copied = globalN.length;
      }
      
      return respond(context, 200, {
        success: true,
        message: `Migrated global research data to project ${projectId}`,
        projectId,
        projectName: project.name,
        migrated: results
      });
    }
    
    return respond(context, 400, { 
      error: "Invalid migration request",
      validRoutes: [
        "GET /api/migrate/global-data - View global research data",
        "POST /api/migrate/{projectId}/from-global - Copy global data to project"
      ]
    });
    
  } catch (error) {
    context.log.error("Migration API error:", error);
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