import Product from '../models/Product.js';
import mongoose from 'mongoose';

let dummyProducts = [
  { _id: '1', name: 'Paracetamol 500mg', category: 'Pain Relief', price: 45, image: '💊' },
  { _id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotics', price: 120, image: '💊', prescriptionRequired: true },
  { _id: '3', name: 'Vitamin C Complex', category: 'Supplements', price: 250, image: '🧴' },
  { _id: '4', name: 'Cough Syrup 100ml', category: 'Cold & Cough', price: 95, image: '🍾' }
];

export const getProducts = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(dummyProducts);
    }
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors can add products' });
    }

    const { name, category, price, image, imageUrl, description, stock, prescriptionRequired } = req.body;
    
    if (mongoose.connection.readyState !== 1) {
      const newProduct = { 
        _id: Date.now().toString(), 
        name, 
        category, 
        price: Number(price), 
        image: image || '💊',
        imageUrl: imageUrl || '',
        description: description || '',
        stock: Number(stock) || 0,
        prescriptionRequired 
      };
      dummyProducts.push(newProduct);
      return res.status(201).json(newProduct);
    }

    const product = await Product.create({
      name, 
      category, 
      price: Number(price), 
      image: image || '💊',
      imageUrl: imageUrl || '',
      description: description || '',
      stock: Number(stock) || 0,
      prescriptionRequired, 
      doctor: req.user._id
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors can update products' });
    }

    if (mongoose.connection.readyState !== 1) {
      const idx = dummyProducts.findIndex(p => p._id === req.params.id);
      if (idx < 0) return res.status(404).json({ message: 'Product not found' });
      const { name, category, price, image, imageUrl, description, stock, prescriptionRequired } = req.body;
      dummyProducts[idx] = { ...dummyProducts[idx], name, category, price: Number(price), image, imageUrl, description, stock: Number(stock), prescriptionRequired };
      return res.json(dummyProducts[idx]);
    }

    const { name, category, price, image, imageUrl, description, stock, prescriptionRequired } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price: Number(price), image, imageUrl, description, stock: Number(stock), prescriptionRequired },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors can delete products' });
    }

    if (mongoose.connection.readyState !== 1) {
      dummyProducts = dummyProducts.filter(p => p._id !== req.params.id);
      return res.json({ message: 'Product removed' });
    }

    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
