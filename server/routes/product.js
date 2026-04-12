const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const { Readable } = require('stream');

// GridFS Bucket Initialization
let gridfsBucket;
const conn = mongoose.connection;

const initBucket = () => {
    if (conn.db && !gridfsBucket) {
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads'
        });
        console.log('GridFS Manual Sync: Ready');
    }
};
conn.once('open', initBucket);

// Use Memory Storage for Multer (Safe & Reliable)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload buffer to GridFS
const uploadToGridFS = (file) => {
    return new Promise((resolve, reject) => {
        initBucket();
        if (!gridfsBucket) return reject(new Error('Database not ready'));

        const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        const uploadStream = gridfsBucket.openUploadStream(filename, {
            contentType: file.mimetype
        });

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        readableStream.pipe(uploadStream)
            .on('error', (err) => reject(err))
            .on('finish', () => resolve(filename));
    });
};

// @route   GET /api/products/image/:filename
router.get('/image/:filename', async (req, res) => {
    try {
        initBucket();
        const files = await gridfsBucket.find({ filename: req.params.filename }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ err: 'Image not found' });
        }
        gridfsBucket.openDownloadStreamByName(req.params.filename).pipe(res);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// @route   GET /api/products
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find({ user: req.id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/products
router.post('/', [auth, upload.single('image')], async (req, res) => {
    try {
        const { name, buyPrice, mrp, stockQuantity } = req.body;
        
        if (!name || !buyPrice || !mrp) {
            return res.status(400).json({ msg: 'Registration requires name, buy price, and MRP.' });
        }

        let imageFilename = null;
        if (req.file) {
            imageFilename = await uploadToGridFS(req.file);
        }

        const newProduct = new Product({
            name,
            buyPrice: Number(buyPrice),
            mrp: Number(mrp),
            stockQuantity: Number(stockQuantity) || 0,
            image: imageFilename,
            user: req.id
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error('File Upload Error:', err.message);
        res.status(500).json({ msg: 'Failed to process product registration', error: err.message });
    }
});

// @route   DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
      initBucket();
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ msg: 'Item not found' });
      
      if (product.user.toString() !== req.id) return res.status(401).json({ msg: 'Unauthorized' });

      if (product.image && gridfsBucket) {
          const files = await gridfsBucket.find({ filename: product.image }).toArray();
          if (files && files.length > 0) {
              await gridfsBucket.delete(files[0]._id);
          }
      }

      await product.deleteOne();
      res.json({ msg: 'Inventory item removed' });
  } catch (err) {
      res.status(500).send('Server Error');
  }
});

module.exports = router;
