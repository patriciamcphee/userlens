/**
 * CosmosDB Service Module
 * 
 * A drop-in replacement for Supabase key-value store patterns.
 * Uses single-container design with document IDs mapping to old Supabase keys.
 * 
 * Key Mapping:
 * | Supabase Key                    | CosmosDB Document ID              | Partition Key |
 * |---------------------------------|-----------------------------------|---------------|
 * | projects:list                   | projects_list                     | global        |
 * | research:hypotheses             | research_hypotheses               | global        |
 * | research:participants           | research_participants             | global        |
 * | research:researchQuestions      | research_researchQuestions        | global        |
 * | research:stickyNotes            | research_stickyNotes              | global        |
 * | synthesis:proj_xxx:hypotheses   | proj_xxx_synthesis_hypotheses     | proj_xxx      |
 * | synthesis:proj_xxx:notes        | proj_xxx_synthesis_notes          | proj_xxx      |
 */

const { CosmosClient } = require("@azure/cosmos");

// ============================================
// CONFIGURATION
// ============================================

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || "insighthub";
const containerId = process.env.COSMOS_DB_CONTAINER || "research";

// Validate configuration
if (!endpoint || !key) {
  console.error("❌ Missing Cosmos DB configuration!");
  console.error("   Set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables.");
}

// Initialize client
const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

// ============================================
// KEY MAPPING UTILITIES
// ============================================

/**
 * Convert Supabase-style key to CosmosDB document ID and partition key
 * @param {string} key - e.g., "projects:list", "research:hypotheses", "synthesis:proj_123:notes"
 * @returns {{ docId: string, partitionKey: string, type: string, dataField: string }}
 */
function parseKey(key) {
  const parts = key.split(':');
  
  // projects:list
  if (key === 'projects:list') {
    return { 
      docId: 'projects_list', 
      partitionKey: 'global', 
      type: 'projects',
      dataField: 'projects'  // The field containing the array
    };
  }
  
  // research:hypotheses, research:participants, etc.
  if (parts[0] === 'research') {
    const type = parts[1];
    return { 
      docId: `research_${type}`, 
      partitionKey: 'global', 
      type,
      dataField: 'data'
    };
  }
  
  // synthesis:proj_xxx:hypotheses, synthesis:proj_xxx:notes, etc.
  if (parts[0] === 'synthesis') {
    const projectId = parts[1];
    const type = parts[2];
    return { 
      docId: `${projectId}_synthesis_${type}`, 
      partitionKey: projectId, 
      type: `synthesis_${type}`,
      dataField: 'data'
    };
  }
  
  // Fallback: treat as global document
  return { 
    docId: key.replace(/:/g, '_'), 
    partitionKey: 'global', 
    type: parts[0],
    dataField: 'data'
  };
}

// ============================================
// CORE KEY-VALUE API (Supabase-compatible)
// ============================================

/**
 * Get value by Supabase-style key
 * @param {string} key - The key (e.g., "projects:list", "research:hypotheses")
 * @returns {Promise<any>} - The data array or null
 */
async function getValue(key) {
  const { docId, partitionKey, dataField } = parseKey(key);
  
  try {
    const { resource } = await container.item(docId, partitionKey).read();
    
    if (!resource) return null;
    
    // Return the data from the appropriate field
    return resource[dataField] || resource.data || null;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

/**
 * Set value by Supabase-style key
 * @param {string} key - The key
 * @param {any} value - The data to store (usually an array)
 * @returns {Promise<void>}
 */
async function setValue(key, value) {
  const { docId, partitionKey, type, dataField } = parseKey(key);
  
  const document = {
    id: docId,
    projectId: partitionKey,
    type: type,
    [dataField]: value,
    _updatedAt: new Date().toISOString()
  };
  
  await container.items.upsert(document);
}

/**
 * Delete a document by key
 * @param {string} key - The key
 * @returns {Promise<void>}
 */
async function deleteValue(key) {
  const { docId, partitionKey } = parseKey(key);
  
  try {
    await container.item(docId, partitionKey).delete();
  } catch (error) {
    if (error.code === 404) return; // Already deleted
    throw error;
  }
}

// ============================================
// PROJECTS API
// ============================================

const projects = {
  /**
   * Get all projects
   * @returns {Promise<any[]>}
   */
  async getAll() {
    const data = await getValue('projects:list');
    return data || [];
  },

  /**
   * Get a single project by ID
   * @param {string} projectId 
   * @returns {Promise<any|null>}
   */
  async getById(projectId) {
    const projects = await this.getAll();
    return projects.find(p => p.id === projectId) || null;
  },

  /**
   * Create a new project
   * @param {object} project - Project data (id will be generated if not provided)
   * @returns {Promise<any>}
   */
  async create(project) {
    const projects = await this.getAll();
    
    const now = new Date().toISOString();
    const newProject = {
      id: project.id || `proj_${Date.now()}`,
      ...project,
      createdAt: now,
      updatedAt: now,
      participants: project.participants || [],
      tasks: project.tasks || [],
      sessions: project.sessions || [],
      totalSessions: 0,
      completedSessions: 0
    };
    
    projects.push(newProject);
    await setValue('projects:list', projects);
    
    return newProject;
  },

  /**
   * Update a project
   * @param {string} projectId 
   * @param {object} updates 
   * @returns {Promise<any>}
   */
  async update(projectId, updates) {
    const projects = await this.getAll();
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) {
      throw new Error(`Project not found: ${projectId}`);
    }
    
    const updatedProject = {
      ...projects[index],
      ...updates,
      id: projectId, // Prevent ID change
      updatedAt: new Date().toISOString()
    };
    
    projects[index] = updatedProject;
    await setValue('projects:list', projects);
    
    return updatedProject;
  },

  /**
   * Delete a project
   * @param {string} projectId 
   * @returns {Promise<void>}
   */
  async delete(projectId) {
    const projects = await this.getAll();
    const filtered = projects.filter(p => p.id !== projectId);
    
    if (filtered.length === projects.length) {
      throw new Error(`Project not found: ${projectId}`);
    }
    
    await setValue('projects:list', filtered);
    
    // Also clean up project-specific synthesis data
    try {
      await deleteValue(`synthesis:${projectId}:hypotheses`);
      await deleteValue(`synthesis:${projectId}:notes`);
      await deleteValue(`synthesis:${projectId}:clusters`);
    } catch (e) {
      // Ignore cleanup errors
    }
  },

  /**
   * Add a session to a project
   * @param {string} projectId 
   * @param {object} session 
   * @returns {Promise<any>}
   */
  async addSession(projectId, session) {
    const project = await this.getById(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }
    
    const sessions = project.sessions || [];
    const newSession = {
      id: session.id || `session_${Date.now()}`,
      ...session,
      createdAt: new Date().toISOString()
    };
    
    sessions.push(newSession);
    
    return this.update(projectId, {
      sessions,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completedAt).length
    });
  }
};

// ============================================
// PARTICIPANTS API (Global pool)
// ============================================

const participants = {
  /**
   * Get all participants from global pool
   * @returns {Promise<any[]>}
   */
  async getAll() {
    const data = await getValue('research:participants');
    return data || [];
  },

  /**
   * Get a participant by ID
   * @param {string} participantId 
   * @returns {Promise<any|null>}
   */
  async getById(participantId) {
    const participants = await this.getAll();
    return participants.find(p => p.id === participantId) || null;
  },

  /**
   * Create a new participant in global pool
   * @param {object} participant 
   * @returns {Promise<any>}
   */
  async create(participant) {
    const participants = await this.getAll();
    
    const newParticipant = {
      id: participant.id || `P${String(participants.length + 1).padStart(2, '0')}`,
      ...participant,
      status: participant.status || 'scheduled',
      addedAt: new Date().toISOString()
    };
    
    participants.push(newParticipant);
    await setValue('research:participants', participants);
    
    return newParticipant;
  },

  /**
   * Update a participant
   * @param {string} participantId 
   * @param {object} updates 
   * @returns {Promise<any>}
   */
  async update(participantId, updates) {
    const participants = await this.getAll();
    const index = participants.findIndex(p => p.id === participantId);
    
    if (index === -1) {
      throw new Error(`Participant not found: ${participantId}`);
    }
    
    participants[index] = {
      ...participants[index],
      ...updates,
      id: participantId
    };
    
    await setValue('research:participants', participants);
    return participants[index];
  },

  /**
   * Delete a participant
   * @param {string} participantId 
   * @returns {Promise<void>}
   */
  async delete(participantId) {
    const participants = await this.getAll();
    const filtered = participants.filter(p => p.id !== participantId);
    await setValue('research:participants', filtered);
  }
};

// ============================================
// RESEARCH QUESTIONS API
// ============================================

const researchQuestions = {
  async getAll() {
    const data = await getValue('research:researchQuestions');
    return data || [];
  },

  async create(question) {
    const questions = await this.getAll();
    
    const newQuestion = {
      id: question.id || `RQ${questions.length + 1}`,
      order: questions.length + 1,
      ...question
    };
    
    questions.push(newQuestion);
    await setValue('research:researchQuestions', questions);
    
    return newQuestion;
  },

  async update(questionId, updates) {
    const questions = await this.getAll();
    const index = questions.findIndex(q => q.id === questionId);
    
    if (index === -1) {
      throw new Error(`Research question not found: ${questionId}`);
    }
    
    questions[index] = { ...questions[index], ...updates, id: questionId };
    await setValue('research:researchQuestions', questions);
    
    return questions[index];
  },

  async delete(questionId) {
    const questions = await this.getAll();
    const filtered = questions.filter(q => q.id !== questionId);
    await setValue('research:researchQuestions', filtered);
  },

  async reorder(orderedIds) {
    const questions = await this.getAll();
    const reordered = orderedIds.map((id, index) => {
      const q = questions.find(q => q.id === id);
      return q ? { ...q, order: index + 1 } : null;
    }).filter(Boolean);
    
    await setValue('research:researchQuestions', reordered);
    return reordered;
  }
};

// ============================================
// HYPOTHESES API
// ============================================

const hypotheses = {
  async getAll() {
    const data = await getValue('research:hypotheses');
    return data || [];
  },

  async create(hypothesis) {
    const hypotheses = await this.getAll();
    
    const newHypothesis = {
      id: hypothesis.id || `H${hypotheses.length + 1}`,
      status: 'testing',
      priority: 'medium',
      segments: [],
      ...hypothesis
    };
    
    hypotheses.push(newHypothesis);
    await setValue('research:hypotheses', hypotheses);
    
    return newHypothesis;
  },

  async update(hypothesisId, updates) {
    const hypotheses = await this.getAll();
    const index = hypotheses.findIndex(h => h.id === hypothesisId);
    
    if (index === -1) {
      throw new Error(`Hypothesis not found: ${hypothesisId}`);
    }
    
    hypotheses[index] = { ...hypotheses[index], ...updates, id: hypothesisId };
    await setValue('research:hypotheses', hypotheses);
    
    return hypotheses[index];
  },

  async delete(hypothesisId) {
    const hypotheses = await this.getAll();
    const filtered = hypotheses.filter(h => h.id !== hypothesisId);
    await setValue('research:hypotheses', filtered);
  }
};

// ============================================
// STICKY NOTES API
// ============================================

const stickyNotes = {
  async getAll() {
    const data = await getValue('research:stickyNotes');
    return data || [];
  },

  async create(note) {
    const notes = await this.getAll();
    
    const newNote = {
      id: note.id || String(Date.now()),
      type: 'insight',
      cluster: 'Uncategorized',
      ...note
    };
    
    notes.push(newNote);
    await setValue('research:stickyNotes', notes);
    
    return newNote;
  },

  async update(noteId, updates) {
    const notes = await this.getAll();
    const index = notes.findIndex(n => n.id === noteId);
    
    if (index === -1) {
      throw new Error(`Sticky note not found: ${noteId}`);
    }
    
    notes[index] = { ...notes[index], ...updates, id: noteId };
    await setValue('research:stickyNotes', notes);
    
    return notes[index];
  },

  async delete(noteId) {
    const notes = await this.getAll();
    const filtered = notes.filter(n => n.id !== noteId);
    await setValue('research:stickyNotes', filtered);
  },

  async getByCluster(clusterName) {
    const notes = await this.getAll();
    return notes.filter(n => n.cluster === clusterName);
  },

  async getClusters() {
    const notes = await this.getAll();
    return [...new Set(notes.map(n => n.cluster).filter(Boolean))];
  }
};

// ============================================
// PROJECT-SCOPED SYNTHESIS API
// ============================================

const synthesis = {
  /**
   * Get synthesis data for a specific project
   * @param {string} projectId 
   * @param {string} type - 'hypotheses', 'notes', 'clusters', 'questions'
   * @returns {Promise<any[]>}
   */
  async get(projectId, type) {
    const data = await getValue(`synthesis:${projectId}:${type}`);
    return data || [];
  },

  /**
   * Set synthesis data for a specific project
   * @param {string} projectId 
   * @param {string} type 
   * @param {any[]} data 
   */
  async set(projectId, type, data) {
    await setValue(`synthesis:${projectId}:${type}`, data);
  },

  /**
   * Add item to project synthesis
   * @param {string} projectId 
   * @param {string} type 
   * @param {object} item 
   */
  async addItem(projectId, type, item) {
    const items = await this.get(projectId, type);
    const newItem = {
      id: item.id || `${type.slice(0, 3)}_${Date.now()}`,
      ...item
    };
    items.push(newItem);
    await this.set(projectId, type, items);
    return newItem;
  },

  /**
 * Update item in project synthesis
 */
async updateItem(projectId, type, itemId, updates) {
  const items = await this.get(projectId, type);
  // Convert both to strings to ensure comparison works
  const index = items.findIndex(i => String(i.id) === String(itemId));
  if (index === -1) throw new Error(`Item not found: ${itemId}`);
  
  items[index] = { ...items[index], ...updates, id: itemId };
  await this.set(projectId, type, items);
  return items[index];
},

  /**
 * Delete item from project synthesis
 */
async deleteItem(projectId, type, itemId) {
  const items = await this.get(projectId, type);
  // Convert both to strings to ensure comparison works
  const filtered = items.filter(i => String(i.id) !== String(itemId));
  
  if (filtered.length === items.length) {
    throw new Error(`Item not found: ${itemId}`);
  }
  
  await this.set(projectId, type, filtered);
},

  /**
   * Initialize synthesis data for a new project
   * @param {string} projectId 
   */
  async initialize(projectId) {
    await this.set(projectId, 'hypotheses', []);
    await this.set(projectId, 'notes', []);
    await this.set(projectId, 'clusters', []);
    await this.set(projectId, 'questions', []);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Initialize the database and container
 */
async function initializeDatabase() {
  try {
    // Create database if not exists
    await client.databases.createIfNotExists({ id: databaseId });
    
    // Create container if not exists
    await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ["/projectId"] }
    });
    
    console.log(`✓ Database "${databaseId}" and container "${containerId}" ready`);
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Get all data (for debugging/export)
 */
async function getAllData() {
  const { resources } = await container.items
    .query("SELECT * FROM c")
    .fetchAll();
  return resources;
}

/**
 * Query documents by type
 * @param {string} type 
 */
async function queryByType(type) {
  const { resources } = await container.items
    .query({
      query: "SELECT * FROM c WHERE c.type = @type",
      parameters: [{ name: "@type", value: type }]
    })
    .fetchAll();
  return resources;
}

/**
 * Query documents by project
 * @param {string} projectId 
 */
async function queryByProject(projectId) {
  const { resources } = await container.items
    .query({
      query: "SELECT * FROM c WHERE c.projectId = @projectId",
      parameters: [{ name: "@projectId", value: projectId }]
    })
    .fetchAll();
  return resources;
}

// ============================================
// AUTH HELPERS
// ============================================

/**
 * Extract tenant ID from Azure AD token (for multi-tenancy)
 */
function extractTenantId(req) {
  const clientPrincipal = req.headers['x-ms-client-principal'];
  
  if (clientPrincipal) {
    try {
      const decoded = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('utf8'));
      const tenantClaim = decoded.claims?.find(c => 
        c.typ === 'tid' || c.typ === 'http://schemas.microsoft.com/identity/claims/tenantid'
      );
      return tenantClaim?.val || null;
    } catch (error) {
      console.error('Error decoding client principal:', error);
    }
  }
  return null;
}

/**
 * Extract user info from Azure AD token
 */
function extractUserInfo(req) {
  const clientPrincipal = req.headers['x-ms-client-principal'];
  
  if (clientPrincipal) {
    try {
      const decoded = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('utf8'));
      return {
        userId: decoded.userId,
        userDetails: decoded.userDetails,
        identityProvider: decoded.identityProvider,
        userRoles: decoded.userRoles || [],
        claims: decoded.claims || []
      };
    } catch (error) {
      console.error('Error decoding client principal:', error);
    }
  }
  return null;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Core key-value API
  getValue,
  setValue,
  deleteValue,
  parseKey,
  
  // Domain APIs
  projects,
  participants,
  researchQuestions,
  hypotheses,
  stickyNotes,
  synthesis,
  
  // Utilities
  initializeDatabase,
  getAllData,
  queryByType,
  queryByProject,
  
  // Auth
  extractTenantId,
  extractUserInfo,
  
  // Raw access (for advanced use)
  client,
  database,
  container,
  databaseId,
  containerId
};
