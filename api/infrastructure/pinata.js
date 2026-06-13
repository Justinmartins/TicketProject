const { PinataSDK } = require('pinata');

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud"
});

async function uploadFileToIPFS(fileBuffer, originalName, mimeType) {
  try {
    const blob = new Blob([fileBuffer], { type: mimeType });
    const file = new File([blob], originalName, { type: mimeType });
    
    const upload = await pinata.upload.public.file(file);
    return upload.cid;
  } catch (error) {
    console.error("Pinata file upload failed:", error);
    throw new Error("Failed to upload image to IPFS");
  }
}

async function uploadJsonToIPFS(jsonData, name) {
  try {
    const upload = await pinata.upload.public.json(jsonData);
    return upload.cid;
  } catch (error) {
    console.error("Pinata JSON upload failed:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
}

module.exports = { uploadFileToIPFS, uploadJsonToIPFS };
