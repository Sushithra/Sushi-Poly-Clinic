import Category from '../models/Category.model.js';
import mongoose from 'mongoose';

const DEFAULT_CATEGORIES = [
  { name: 'Pain Relief', slug: 'pain-relief', icon: '💊', description: 'Medicines for pain and inflammation' },
  { name: 'Antibiotics', slug: 'antibiotics', icon: '💉', description: 'Prescription antibiotic medicines' },
  { name: 'Supplements', slug: 'supplements', icon: '🧴', description: 'Vitamins and dietary supplements' },
  { name: 'Cold & Flu', slug: 'cold-flu', icon: '🤧', description: 'Cold, flu, and respiratory medicines' },
  { name: 'First Aid', slug: 'first-aid', icon: '🩹', description: 'First aid supplies and wound care' },
  { name: 'Skincare', slug: 'skincare', icon: '🧴', description: 'Dermatology and skincare products' }
];

const seedCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
  }
};

export const getCategories = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(DEFAULT_CATEGORIES);
    }
    await seedCategories();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors or admins can create categories' });
    }

    const { name, icon, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name, slug, icon: icon || '💊', description: description || '' });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors or admins can update categories' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    const { name, icon, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors or admins can delete categories' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
