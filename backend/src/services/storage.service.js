// const ImageKit = require("imagekit");

// const imagekit = new ImageKit({
//     publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
//     privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
//     urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
// });

// async function uploadFile(file, fileName) {
//     // Convert buffer to base64 for ImageKit
//     const base64File = Buffer.isBuffer(file) ? file.toString('base64') : file;
    
//     const result = await imagekit.upload({
//         file: base64File,
//         fileName: fileName,
//     });

//     return result;
// }

// module.exports = {
//     uploadFile
// }












const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {String} fileName - Original file name or UUID
 * @param {String} type - 'video', 'audio', or 'image' (default is video)
 */
const uploadFile = (fileBuffer, fileName, type = "video") => {
  return new Promise((resolve, reject) => {
    // 1. Validation
    if (!fileBuffer || fileBuffer.length === 0) {
      return reject(new Error('File buffer is empty or undefined'));
    }

    console.log(`🚀 Starting Cloudinary upload [${type}]:`, fileName);
    console.log(`📦 File buffer size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);

    // 2. Setup Cloudinary Options
    const uploadOptions = {
      folder: type === "audio" ? "SnapEat_Voices" : type === "image" ? "SnapEat_Images" : "SnapEat_Reels",
      public_id: fileName.split('.')[0],
    };

    // Set resource type based on file type
    if (type === "image") {
      uploadOptions.resource_type = "image";
    } else {
      uploadOptions.resource_type = "video"; // Cloudinary uses "video" for both video and audio
    }

    // For audio files, force MP3 conversion for maximum browser compatibility
    if (type === "audio") {
      uploadOptions.format = "mp3";
    } else if (type === "video") {
      // For video files, apply quality optimization
      uploadOptions.transformation = [
        { quality: "auto:low" },
        { fetch_format: "auto" }
      ];
    }

    console.log('📋 Upload options:', JSON.stringify(uploadOptions, null, 2));

    // 3. Create Upload Stream
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return reject(error);
        }
        
        if (!result || !result.secure_url) {
          console.error('❌ Upload succeeded but no URL returned');
          return reject(new Error('Upload succeeded but no URL returned'));
        }
        
        console.log('✅ Cloudinary upload successful!');
        console.log('🔗 URL:', result.secure_url);
        console.log('📊 Format:', result.format);
        console.log('🎵 Resource type:', result.resource_type);
        
        // Return an object with url property for compatibility
        resolve({ url: result.secure_url, ...result });
      }
    );

    // 4. Convert Buffer to Stream and Pipe
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

module.exports = { uploadFile };