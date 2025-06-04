import { Router, Request, Response, NextFunction } from 'express';
import { storage as dbStorage } from '../storage';
import { processCsvFile, extractMissingProducts } from '../utils/csv-processor';
import { insertProductSchema } from '@shared/schema';
import { z } from 'zod';
import multer from 'multer';
import busboy from 'busboy';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Define request type with file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure upload with memory storage as backup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

const router = Router();

// CSV file upload route - raw busboy implementation
router.post('/csv', (req: Request, res: Response) => {
  console.log('Processing CSV upload with raw busboy implementation...');
  console.log('Content Type:', req.headers['content-type']);
  
  try {
    // Create busboy instance
    const bb = busboy({ 
      headers: req.headers,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only allow one file
      }
    });
    
    let csvFile: { buffer: Buffer; filename: string } | null = null;
    let weekOf: string | null = null;
    let errorOccurred = false;
    
    // Handle file upload
    bb.on('file', (name, file, info) => {
      if (name !== 'csvFile') {
        console.log(`Skipping non-CSV file field: ${name}`);
        file.resume(); // Skip this file
        return;
      }
      
      console.log(`Processing file [${info.filename}] with fieldname [${name}]`);
      const chunks: Buffer[] = [];
      
      file.on('data', (data) => {
        console.log(`Received ${data.length} bytes of file data`);
        chunks.push(data);
      });
      
      file.on('limit', () => {
        errorOccurred = true;
        console.error('File size limit reached');
        res.status(400).json({ error: 'File too large', message: 'The file exceeds the 10MB size limit' });
      });
      
      file.on('end', () => {
        if (errorOccurred) return;
        
        console.log('File upload complete');
        csvFile = {
          buffer: Buffer.concat(chunks),
          filename: info.filename
        };
      });
    });
    
    // Handle fields
    bb.on('field', (name, val) => {
      if (name === 'weekOf') {
        console.log(`Received weekOf field: ${val}`);
        weekOf = val;
      }
    });
    
    // Handle parsing completion
    bb.on('close', async () => {
      if (errorOccurred) return;
      
      try {
        // Validate required data
        if (!csvFile) {
          return res.status(400).json({ error: 'Missing file', message: 'No CSV file was uploaded' });
        }
        
        if (!weekOf) {
          return res.status(400).json({ error: 'Missing weekOf', message: 'The weekOf field is required' });
        }
        
        // Convert CSV data to string
        const csvString = csvFile.buffer.toString('utf8');
        console.log(`CSV data preview: ${csvString.substring(0, 100)}...`);
        
        // Parse week date
        const weekDate = new Date(weekOf);
        if (isNaN(weekDate.getTime())) {
          return res.status(400).json({ error: 'Invalid date', message: 'The weekOf value is not a valid date' });
        }
        
        // Process CSV file
        const result = await processCsvFile(
          csvString,
          csvFile.filename,
          weekDate,
          true
        );
        
        // Return success
        return res.status(200).json({
          importId: result.importId,
          processedItems: result.processedItems,
          analyzedItems: result.analyzedItems
        });
      } catch (error) {
        console.error('Error processing CSV:', error);
        return res.status(500).json({ 
          error: 'Processing failed', 
          message: error instanceof Error ? error.message : 'Unknown error processing the file'
        });
      }
    });
    
    // Handle errors
    bb.on('error', (err: Error) => {
      console.error('Busboy error:', err);
      errorOccurred = true;
      res.status(400).json({ error: 'Upload error', message: err.message });
    });
    
    // Pipe the request to busboy
    req.pipe(bb);
  } catch (err: unknown) {
    console.error('Error setting up busboy:', err);
    return res.status(500).json({ error: 'Server error', message: 'Failed to process upload' });
  }
});

// Check missing products route using JSON/base64 approach
router.post('/check-missing-products', async (req: Request, res: Response) => {
  try {
    console.log('Processing missing products check via JSON endpoint');
    
    // Validate request
    const { filename, fileContent, contentType } = req.body;
    
    if (!filename || !fileContent) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing required fields (filename, fileContent)'
      });
    }
    
    console.log(`Received file for missing products check: ${filename}, type: ${contentType}, content length: ${fileContent.length}`);
    
    // The fileContent is now sent as plain text, no need to decode
    const csvString = fileContent;
    console.log(`Decoded CSV content sample for missing products: ${csvString.substring(0, 100)}...`);
    
    // Process CSV file
    const result = await extractMissingProducts(csvString, true);
    
    // Return success
    return res.status(200).json({
      missingProducts: result.missingProducts,
      totalProducts: result.totalProducts
    });
  } catch (error) {
    console.error('Error checking missing products:', error);
    return res.status(500).json({ 
      error: 'Processing failed', 
      message: error instanceof Error ? error.message : 'Unknown error processing the file'
    });
  }
});

// Schema for adding products
const addProductsSchema = z.object({
  products: z.array(insertProductSchema.extend({
    size: z.string().optional().nullable(),
    storeId: z.number()
  }))
});

// In-memory storage for accumulated chunk data
const chunkStorage = new Map<string, {
  chunks: string[];
  totalChunks: number;
  filename: string;
  contentType: string;
  weekOf: string;
  receivedChunks: number;
}>();

// JSON-based CSV upload route with chunking support
router.post('/csv-json', async (req: Request, res: Response) => {
  try {
    console.log('Processing CSV upload via JSON endpoint');
    
    // Validate request
    const { filename, fileContent, contentType, weekOf, chunkData } = req.body;
    
    if (!filename || !fileContent || !weekOf || !chunkData) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Missing required fields (filename, fileContent, weekOf, chunkData)'
      });
    }
    
    console.log(`Received chunk ${chunkData.chunkIndex + 1}/${chunkData.totalChunks} for ${filename}, content length: ${fileContent.length}`);
    
    // Generate a unique key for this file upload session
    const fileKey = `${filename}-${weekOf}`;
    
    // Store the chunk
    if (!chunkStorage.has(fileKey)) {
      // Initialize new file chunks
      chunkStorage.set(fileKey, {
        chunks: new Array(chunkData.totalChunks).fill(''),
        totalChunks: chunkData.totalChunks,
        filename,
        contentType,
        weekOf,
        receivedChunks: 0
      });
    }
    
    // Get the current storage for this file
    const fileChunks = chunkStorage.get(fileKey)!;
    
    // Store this chunk
    fileChunks.chunks[chunkData.chunkIndex] = fileContent;
    fileChunks.receivedChunks++;
    
    console.log(`Stored chunk ${chunkData.chunkIndex + 1}/${chunkData.totalChunks}. Received ${fileChunks.receivedChunks}/${fileChunks.totalChunks} chunks.`);
    
    // If this is not the last chunk or we haven't received all chunks yet, just acknowledge receipt
    if (!chunkData.isLastChunk || fileChunks.receivedChunks < fileChunks.totalChunks) {
      return res.status(200).json({
        status: 'chunk-received',
        message: `Chunk ${chunkData.chunkIndex + 1}/${chunkData.totalChunks} received successfully`,
        receivedChunks: fileChunks.receivedChunks,
        totalChunks: fileChunks.totalChunks
      });
    }
    
    // If we've received all chunks, combine them and process
    console.log(`All ${fileChunks.totalChunks} chunks received for ${filename}. Combining and processing...`);
    
    // Combine all chunks to get the complete CSV content
    const csvString = fileChunks.chunks.join('');
    console.log(`Combined CSV content length: ${csvString.length}`);
    console.log(`CSV content sample: ${csvString.substring(0, 100)}...`);
    
    // Parse week date
    const weekDate = new Date(weekOf);
    if (isNaN(weekDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date', 
        message: 'The weekOf value is not a valid date' 
      });
    }
    
    // Process the CSV
    const result = await processCsvFile(
      csvString,
      filename,
      weekDate,
      true // Process as string content
    );
    
    // Clean up chunk storage for this file
    chunkStorage.delete(fileKey);
    
    // Return success response
    return res.status(200).json({
      importId: result.importId,
      processedItems: result.processedItems,
      analyzedItems: result.analyzedItems
    });
  } catch (error) {
    console.error('Error processing CSV via JSON endpoint:', error);
    return res.status(500).json({ 
      error: 'Processing failed', 
      message: error instanceof Error ? error.message : 'Unknown error processing the file'
    });
  }
});

// Add products route 
router.post('/add-products', async (req: Request, res: Response) => {
  try {
    const validationResult = addProductsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: validationResult.error.format() 
      });
    }

    const { products } = validationResult.data;
    const addedProducts = [];

    for (const productData of products) {
      const { storeId, ...productFields } = productData;
      const product = await dbStorage.createProduct(productFields);

      await dbStorage.createProductPrice({
        productId: product.id,
        storeId: storeId,
        price: "0.00"
      });

      addedProducts.push(product);
    }

    return res.status(200).json({
      success: true,
      addedProducts,
      count: addedProducts.length
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to add products',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;