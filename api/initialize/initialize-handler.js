/**
 * Initialize Database
 * 
 * Creates the CosmosDB database and container if they don't exist.
 * Also optionally seeds with sample data.
 * 
 * POST /api/initialize-database
 * POST /api/initialize-database?seed=true
 */

const { 
  initializeDatabase, 
  getValue, 
  setValue,
  databaseId,
  containerId
} = require("../cosmosService");

// Sample data for seeding
const SAMPLE_DATA = {
  researchQuestions: [
    { id: "RQ1", order: 1, question: "Why aren't engineering teams adopting Alchemy?" },
    { id: "RQ2", order: 2, question: "How does Alchemy fit (or not fit) into developer workflows?" },
    { id: "RQ3", order: 3, question: "Where do users struggle in the interface and workflows?" },
    { id: "RQ4", order: 4, question: "How do team dynamics and culture affect adoption?" }
  ],
  hypotheses: [
    {
      id: "H1",
      status: "testing",
      priority: "high",
      hypothesis: "Onboarding is the #1 barrier",
      description: "Developers abandon or avoid the platform because there's no clear starting point.",
      evidence: "8/8 participants mentioned onboarding pain points",
      segments: ["Non-Users", "Abandoned", "Occasional"],
      researchQuestionId: "RQ1"
    }
  ],
  stickyNotes: [
    { id: "1", text: "Didn't know where to start", type: "barrier", cluster: "Onboarding Barriers" },
    { id: "2", text: "Unclear value proposition", type: "barrier", cluster: "Onboarding Barriers" },
    { id: "3", text: "Video tutorials needed", type: "insight", cluster: "Documentation Gaps" }
  ]
};

module.exports = async function (context, req) {
  try {
    context.log("Initializing database...");
    
    // Initialize database and container
    await initializeDatabase();
    
    const result = {
      success: true,
      database: databaseId,
      container: containerId,
      seeded: false
    };
    
    // Optionally seed with sample data
    if (req.query.seed === 'true') {
      context.log("Seeding sample data...");
      
      // Check if data already exists
      const existingQuestions = await getValue('research:researchQuestions');
      
      if (!existingQuestions || existingQuestions.length === 0) {
        await setValue('research:researchQuestions', SAMPLE_DATA.researchQuestions);
        await setValue('research:hypotheses', SAMPLE_DATA.hypotheses);
        await setValue('research:stickyNotes', SAMPLE_DATA.stickyNotes);
        await setValue('research:participants', []);
        await setValue('projects:list', []);
        
        result.seeded = true;
        result.seededCollections = ['researchQuestions', 'hypotheses', 'stickyNotes', 'participants', 'projects'];
        context.log("Sample data seeded successfully");
      } else {
        result.seeded = false;
        result.message = "Data already exists, skipping seed";
      }
    }
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: result
    };
    
  } catch (error) {
    context.log.error("Database initialization error:", error);
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
