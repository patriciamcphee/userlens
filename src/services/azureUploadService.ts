// services/azureUploadService.ts
// Integrates with existing utils/recording.ts to add Azure upload capability

import { BlobServiceClient } from '@azure/storage-blob';

interface AzureConfig {
  accountName: string;
  sasToken: string;
  containerName: string;
}

class AzureUploadService {
  private config: AzureConfig | null = null;

  initialize(config: AzureConfig) {
    this.config = config;
    console.log('☁️ Azure Upload Service initialized:', {
      accountName: config.accountName,
      containerName: config.containerName,
      sasTokenPresent: !!config.sasToken
    });
  }

  async uploadRecording(
    blob: Blob, 
    filename: string,
    metadata?: { duration?: number; size?: number; hasVideo?: boolean; hasAudio?: boolean }
  ): Promise<string> {
    if (!this.config) {
      throw new Error('Azure Upload Service not initialized. Call initialize() first.');
    }

    console.log('📤 Starting Azure upload...');
    console.log('File details:', {
      filename,
      size: blob.size,
      sizeMB: (blob.size / 1024 / 1024).toFixed(2),
      type: blob.type,
      metadata
    });

    try {
      // Build Azure URL
      const blobServiceUrl = `https://${this.config.accountName}.blob.core.windows.net`;
      const sasToken = this.config.sasToken.startsWith('?') 
        ? this.config.sasToken 
        : `?${this.config.sasToken}`;

      console.log('Connecting to:', blobServiceUrl);

      // Create clients
      const blobServiceClient = new BlobServiceClient(`${blobServiceUrl}${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient(this.config.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      // Check container exists
      const containerExists = await containerClient.exists();
      if (!containerExists) {
        throw new Error(`Container "${this.config.containerName}" does not exist`);
      }
      console.log('✅ Container verified');

      // Set blob properties
      const blobHTTPHeaders = {
        blobContentType: blob.type || 'video/webm'
      };

      // Add custom metadata if provided
      const blobMetadata: Record<string, string> = {};
      if (metadata) {
        if (metadata.duration) blobMetadata.duration = String(metadata.duration);
        if (metadata.size) blobMetadata.size = String(metadata.size);
        if (metadata.hasVideo !== undefined) blobMetadata.hasVideo = String(metadata.hasVideo);
        if (metadata.hasAudio !== undefined) blobMetadata.hasAudio = String(metadata.hasAudio);
      }

      // Upload with progress tracking
      console.log('📤 Uploading...');
      const uploadStartTime = Date.now();

      const uploadResponse = await blockBlobClient.uploadData(blob, {
        blobHTTPHeaders,
        metadata: blobMetadata,
        onProgress: (progress) => {
          const percent = ((progress.loadedBytes / blob.size) * 100).toFixed(1);
          console.log(`📤 Upload progress: ${percent}%`);
        }
      });

      const uploadDuration = Date.now() - uploadStartTime;
      const uploadSpeedMBps = (blob.size / 1024 / 1024) / (uploadDuration / 1000);

      console.log('✅ Upload completed!', {
        duration: `${uploadDuration}ms`,
        speed: `${uploadSpeedMBps.toFixed(2)} MB/s`,
        requestId: uploadResponse.requestId
      });

      // Return the URL (without SAS token for security)
      const blobUrl = blockBlobClient.url.split('?')[0];
      console.log('📍 Recording URL:', blobUrl);

      return blobUrl;

    } catch (error: any) {
      console.error('❌ Azure upload failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });

      // Provide helpful error messages
      if (error.statusCode === 403) {
        throw new Error('Upload forbidden: Check SAS token permissions and expiry');
      } else if (error.statusCode === 404) {
        throw new Error('Upload failed: Container or account not found');
      } else if (error.message?.includes('CORS')) {
        throw new Error('CORS error: Configure CORS in Azure Storage settings');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      console.error('❌ Azure Upload Service not initialized');
      return false;
    }

    try {
      console.log('🧪 Testing Azure connection...');
      
      const blobServiceUrl = `https://${this.config.accountName}.blob.core.windows.net`;
      const sasToken = this.config.sasToken.startsWith('?') 
        ? this.config.sasToken 
        : `?${this.config.sasToken}`;
      
      const blobServiceClient = new BlobServiceClient(`${blobServiceUrl}${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient(this.config.containerName);
      
      const exists = await containerClient.exists();
      console.log('✅ Connection test result:', exists);
      
      return exists;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const azureUploadService = new AzureUploadService();