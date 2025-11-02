import { BlobServiceClient } from '@azure/storage-blob';

const accountName = process.env.VITE_AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.VITE_AZURE_STORAGE_SAS_TOKEN;
const containerName = process.env.VITE_AZURE_STORAGE_CONTAINER_NAME;

async function testAzure() {
  console.log('Testing Azure connection...');
  console.log('Account:', accountName);
  console.log('Container:', containerName);
  console.log('SAS token present:', !!sasToken);

  try {
    const blobServiceUrl = `https://${accountName}.blob.core.windows.net`;
    const blobServiceClient = new BlobServiceClient(`${blobServiceUrl}${sasToken}`);
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    console.log('Checking container...');
    const exists = await containerClient.exists();
    console.log('Container exists:', exists);

    if (exists) {
      console.log('✅ Connection successful!');
      
      // Try uploading test file
      const testBlob = containerClient.getBlockBlobClient('test.txt');
      await testBlob.upload('test content', 12);
      console.log('✅ Test upload successful!');
      
      // Clean up
      await testBlob.delete();
      console.log('✅ Test cleanup complete!');
    } else {
      console.error('❌ Container not found');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAzure();