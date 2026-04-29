import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/Product';
import Review from '../models/review';

const normalizeProductImages = (images: unknown): string[] => {
  if (Array.isArray(images)) {
    return images
      .map((image) => String(image).trim())
      .filter(Boolean);
  }

  if (typeof images === 'string') {
    return images
      .split(/\r?\n|,/)
      .map((image) => image.trim())
      .filter(Boolean);
  }

  return [];
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      brand,
      category,
      price,
      originalPrice,
      discountPercent,
      countInStock,
      images,
      isFeatured,
      isPublished,
      showInNewArrivals,
    } = req.body;
    const normalizedImages = normalizeProductImages(images);

    // Basic required field validation
    if (!name || !slug || !description || !category || price === undefined || countInStock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (normalizedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
      });
    }

    // Check existing slug
    const existingProduct = await Product.findOne({ where: { slug: slug.toLowerCase().trim() } });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      description: description.trim(),
      shortDescription: shortDescription?.trim() || '',
      brand: brand?.trim() || '',
      category: category.trim(),
      price,
      originalPrice: originalPrice || 0,
      discountPercent: discountPercent || 0,
      countInStock,
      images: normalizedImages,
      isFeatured: isFeatured || false,
      isPublished: isPublished !== undefined ? isPublished : true,
      showInNewArrivals: showInNewArrivals === true,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const keyword = req.query.keyword ? String(req.query.keyword).trim() : '';
    const category = req.query.category ? String(req.query.category).trim() : '';
    const brand = req.query.brand ? String(req.query.brand).trim() : '';
    const featured = req.query.featured ? String(req.query.featured) : '';
    const published = req.query.published ? String(req.query.published) : '';

    const where: any = {};

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (featured === 'false') {
      where.isFeatured = false;
    }

    if (published === 'true') {
      where.isPublished = true;
    }

    if (published === 'false') {
      where.isPublished = false;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    return res.status(200).json({
      success: true,
      count: rows.length,
      totalProducts: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      products: rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numId = Number(id);

    if (isNaN(numId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findByPk(numId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const reviews = await Review.findAll({
      where: { product: numId },
      order: [['createdAt', 'DESC']],
      attributes: ['name', 'rating', 'comment', 'user', 'createdAt', 'updatedAt'],
    });

    return res.status(200).json({
      success: true,
      product,
      reviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numId = Number(id);

    if (isNaN(numId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const existingProduct = await Product.findByPk(numId);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // If slug is being updated, check uniqueness
    if (req.body.slug) {
      const slugExists = await Product.findOne({
        where: {
          slug: req.body.slug.toLowerCase().trim(),
          id: { [Op.ne]: numId },
        },
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Another product with this slug already exists',
        });
      }
    }

    const updatedData = {
      ...req.body,
      ...(req.body.images !== undefined && {
        images: normalizeProductImages(req.body.images),
      }),
      ...(req.body.name && { name: req.body.name.trim() }),
      ...(req.body.slug && { slug: req.body.slug.toLowerCase().trim() }),
      ...(req.body.description && { description: req.body.description.trim() }),
      ...(req.body.shortDescription !== undefined && {
        shortDescription: req.body.shortDescription?.trim(),
      }),
      ...(req.body.brand !== undefined && {
        brand: req.body.brand?.trim(),
      }),
      ...(req.body.category && { category: req.body.category.trim() }),
    };

    if (updatedData.images && updatedData.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
      });
    }

    await existingProduct.update(updatedData);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: existingProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numId = Number(id);

    if (isNaN(numId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findByPk(numId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
};
