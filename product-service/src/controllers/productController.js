import Product from '../models/Product.js';
import { ApiError } from '../middlewares/errorHandler.js';
import axios from 'axios';
import config from '../config/index.js';

/**
 * Fetch stock data for products from inventory service
 */
async function fetchStockData(productIds) {
  try {
    const stockMap = {};
    
    // Fetch stock data for each product
    await Promise.all(
      productIds.map(async (productId) => {
        try {
          const response = await axios.get(
            `${config.inventoryServiceUrl}/inventory/${productId}`
          );
          stockMap[productId] = response.data.stock || 0;
        } catch (error) {
          // If inventory not found, default to 0
          stockMap[productId] = 0;
        }
      })
    );
    
    return stockMap;
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    // Return empty map if service is down
    return {};
  }
}

/**
 * Create a new product (admin only)
 * POST /products
 */
export async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, images } = req.body;

    if (!name || !description || price === undefined || !category) {
      throw new ApiError(400, 'name, description, price, and category are required');
    }

    if (price < 0) {
      throw new ApiError(400, 'price must be non-negative');
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images: images || [],
      createdBy: req.user.id,
    });

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a product (admin only)
 * PUT /products/:id
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, category, images, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      if (price < 0) throw new ApiError(400, 'price must be non-negative');
      updateData.price = price;
    }
    if (category !== undefined) updateData.category = category;
    if (images !== undefined) updateData.images = images;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
}

/**
 * Soft delete a product (admin only)
 * DELETE /products/:id
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.status(200).json({ message: 'Product deactivated', product });
  } catch (err) {
    next(err);
  }
}

/**
 * List all active products (public)
 * GET /products
 */
export async function listProducts(req, res, next) {
  try {
    const { category, limit = 50, skip = 0 } = req.query;

    const filter = { isActive: true };
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    // Fetch stock data for all products
    const productIds = products.map(p => p._id.toString());
    const stockMap = await fetchStockData(productIds);

    // Merge stock data with products
    const productsWithStock = products.map(product => ({
      ...product.toObject(),
      stock: stockMap[product._id.toString()] || 0,
      stockQuantity: stockMap[product._id.toString()] || 0,
    }));

    res.status(200).json({
      products: productsWithStock,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get product by ID (public)
 * GET /products/:id
 */
export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select('-__v');

    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found');
    }

    // Fetch stock data for this product
    const stockMap = await fetchStockData([id]);
    const productWithStock = {
      ...product.toObject(),
      stock: stockMap[id] || 0,
      stockQuantity: stockMap[id] || 0,
    };

    res.status(200).json({ product: productWithStock });
  } catch (err) {
    next(err);
  }
}
