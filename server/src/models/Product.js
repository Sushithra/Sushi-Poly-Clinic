import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '💊' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  stock: { type: Number, default: 100, min: 0 },
  prescriptionRequired: { type: Boolean, default: false },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
