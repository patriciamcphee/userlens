const { BlobServiceClient } = require("@azure/storage-blob");
const { getContainer } = require("../cosmosClient");

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || "recordings";

module.exports = async function (context, req) {
  context.log("=== UPLOAD RECORDING REQUEST STARTED ===");
  
  try {
    // Validate Azure Storage configuration
    if (!connectionString) {
      context.log.error("Missing AZURE_STORAGE_CONNECTION_STRING");
      context.res = {
        status: 500,
        body: { error: "Storage not configured" }
      };
      return;
    }
    
    // Parse multipart form data
    // Note: Azure Functions v4 handles this differently than v3
    // For binary uploads, the body contains the raw data
    const contentType = req.headers["content-type"] || "";
    
    let fileBuffer, filename, projectId, participantId, sessionId;
    let duration = 0, tasksCompleted = 0, totalTasks = 0, clicks = 0, keystrokes = 0;
    let hasVideo = true, hasAudio = true;
    
    if (contentType.includes("application/json")) {
      // JSON payload with base64-encoded file
      const body = req.body;
      
      if (!body.file || !body.projectId || !body.participantId) {
        context.res = {
          status: 400,
          body: { error: "Missing required fields: file, projectId, participantId" }
        };
        return;
      }
      
      // Decode base64 file
      fileBuffer = Buffer.from(body.file, "base64");
      projectId = body.projectId;
      participantId = body.participantId;
      sessionId = body.sessionId || `session_${Date.now()}`;
      filename = body.filename || `${sessionId}.webm`;
      
      // Session analytics
      duration = parseInt(body.duration) || 0;
      tasksCompleted = parseInt(body.tasksCompleted) || 0;
      totalTasks = parseInt(body.totalTasks) || 0;
      clicks = parseInt(body.clicks) || 0;
      keystrokes = parseInt(body.keystrokes) || 0;
      hasVideo = body.hasVideo !== false;
      hasAudio = body.hasAudio !== false;
      
    } else if (contentType.includes("multipart/form-data")) {
      // Multipart form data (browser upload)
      // Azure Functions doesn't natively parse multipart, so we use a simple parser
      // In production, consider using a library like 'parse-multipart-data'
      
      context.log("Multipart upload detected - parsing form data");
      
      // For now, return an error suggesting JSON upload
      // You can implement multipart parsing if needed
      context.res = {
        status: 400,
        body: { 
          error: "Please use JSON upload with base64-encoded file",
          hint: "Set Content-Type to application/json and encode file as base64"
        }
      };
      return;
      
    } else if (req.body && Buffer.isBuffer(req.body)) {
      // Raw binary upload with metadata in headers
      fileBuffer = req.body;
      projectId = req.headers["x-project-id"];
      participantId = req.headers["x-participant-id"];
      sessionId = req.headers["x-session-id"] || `session_${Date.now()}`;
      filename = req.headers["x-filename"] || `${sessionId}.webm`;
      
      duration = parseInt(req.headers["x-duration"]) || 0;
      tasksCompleted = parseInt(req.headers["x-tasks-completed"]) || 0;
      totalTasks = parseInt(req.headers["x-total-tasks"]) || 0;
      
      if (!projectId || !participantId) {
        context.res = {
          status: 400,
          body: { error: "Missing required headers: x-project-id, x-participant-id" }
        };
        return;
      }
    } else {
      context.res = {
        status: 400,
        body: { error: "Unsupported content type. Use application/json with base64 file or binary with headers." }
      };
      return;
    }
    
    const fileSizeMB = fileBuffer.length / 1024 / 1024;
    context.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    // Check file size limit (100MB)
    if (fileBuffer.length > 100 * 1024 * 1024) {
      context.res = {
        status: 413,
        body: { error: "File size exceeds 100MB limit" }
      };
      return;
    }
    
    // Connect to Azure Blob Storage
    context.log("Connecting to Azure Blob Storage...");
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Ensure container exists
    await containerClient.createIfNotExists({
      access: "blob" // or "container" for public access, "private" for no public access
    });
    
    // Generate blob path: recordings/{projectId}/{participantId}/{timestamp}.webm
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const blobName = `${projectId}/${participantId}/${timestamp}.webm`;
    
    context.log(`Uploading to blob: ${blobName}`);
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload with metadata
    const uploadResponse = await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: "video/webm"
      },
      metadata: {
        projectId,
        participantId,
        sessionId,
        duration: String(duration),
        tasksCompleted: String(tasksCompleted),
        totalTasks: String(totalTasks),
        hasVideo: String(hasVideo),
        hasAudio: String(hasAudio),
        uploadedAt: new Date().toISOString()
      }
    });
    
    context.log(`Upload complete. Request ID: ${uploadResponse.requestId}`);
    
    // Generate the blob URL (without SAS for now - configure access level as needed)
    const blobUrl = blockBlobClient.url;
    
    // Update participant record with recording info
    try {
      const projectsContainer = await getContainer("projects");
      
      // Fetch the project
      const { resource: project } = await projectsContainer.item(projectId, projectId).read();
      
      if (project && project.participants) {
        const participantIndex = project.participants.findIndex(p => p.id === participantId);
        
        if (participantIndex !== -1) {
          const participant = project.participants[participantIndex];
          
          // Initialize session history if needed
          if (!participant.sessionHistory) {
            participant.sessionHistory = [];
          }
          
          // Add new session
          const newSession = {
            id: sessionId,
            timestamp: new Date().toISOString(),
            duration,
            tasksCompleted,
            totalTasks,
            clicks,
            keystrokes,
            recordingUrl: blobUrl,
            recordingStoragePath: blobName,
            completionRate: totalTasks > 0 ? (tasksCompleted / totalTasks * 100) : 0,
            hasVideo,
            hasAudio
          };
          
          participant.sessionHistory.push(newSession);
          
          // Update latest recording info
          participant.recordingUrl = blobUrl;
          participant.recordingStoragePath = blobName;
          participant.lastSessionDate = new Date().toISOString();
          participant.status = "completed";
          
          // Save updated project
          project.updatedAt = new Date().toISOString();
          await projectsContainer.item(projectId, projectId).replace(project);
          
          context.log(`Updated participant ${participantId} with recording info`);
        }
      }
    } catch (dbError) {
      // Log but don't fail - the recording was uploaded successfully
      context.log.warn("Failed to update participant record:", dbError.message);
    }
    
    context.log("=== UPLOAD RECORDING COMPLETED SUCCESSFULLY ===");
    
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        success: true,
        url: blobUrl,
        path: blobName,
        size: fileBuffer.length,
        sessionId
      }
    };
    
  } catch (error) {
    context.log.error("=== ERROR UPLOADING RECORDING ===");
    context.log.error("Error:", error.message);
    context.log.error("Stack:", error.stack);
    
    context.res = {
      status: 500,
      body: {
        error: "Failed to upload recording",
        message: error.message
      }
    };
  }
};
