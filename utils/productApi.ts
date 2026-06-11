import axios from "axios";
import { buildApiUrl } from "@/utils/api";

const API_BASE_URL = buildApiUrl("/api/products");
const DEFAULT_CATALOG_LIMIT = 1000;

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  countInStock: number;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  showInNewArrivals: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsResponse {
  success: boolean;
  count: number;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  products: Product[];
}

export interface GetSingleProductResponse {
  success: boolean;
  product: Product;
  reviews?: ProductReview[];
}

export interface CreateProductResponse {
  success: boolean;
  message: string;
  product: Product;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

export type ProductListParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  brand?: string;
  featured?: boolean;
  published?: boolean;
};

const FALLBACK_PRODUCT_IMAGE = "/favicon/product.jpeg";

const normalizeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const normalizeBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }

    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return fallback;
};

const normalizeProduct = (product: any): Product => {
  const images = Array.isArray(product?.images)
    ? product.images.map((image: unknown) => String(image).trim()).filter(Boolean)
    : typeof product?.image === "string" && product.image.trim()
      ? [product.image.trim()]
      : [];

  return {
    ...product,
    _id: String(product?._id ?? product?.id ?? ""),
    price: normalizeNumber(product?.price),
    originalPrice:
      product?.originalPrice !== undefined
        ? normalizeNumber(product.originalPrice)
        : undefined,
    discountPercent:
      product?.discountPercent !== undefined
        ? normalizeNumber(product.discountPercent)
        : undefined,
    countInStock: normalizeNumber(product?.countInStock),
    rating: normalizeNumber(product?.rating),
    numReviews: normalizeNumber(product?.numReviews),
    isFeatured: normalizeBoolean(product?.isFeatured),
    isPublished: normalizeBoolean(product?.isPublished, true),
    showInNewArrivals: normalizeBoolean(product?.showInNewArrivals),
    images: images.length > 0 ? images : [FALLBACK_PRODUCT_IMAGE],
  };
};

const normalizeReview = (review: any): ProductReview => ({
  ...review,
  _id: String(review?._id ?? review?.id ?? ""),
  rating: normalizeNumber(review?.rating),
});

export const getAllProducts = async (
  params: ProductListParams = {}
): Promise<GetProductsResponse> => {
  const response = await axios.get(API_BASE_URL, {
    params: {
      limit: DEFAULT_CATALOG_LIMIT,
      ...params,
    },
  });

  return {
    ...response.data,
    products: Array.isArray(response.data?.products)
      ? response.data.products.map(normalizeProduct)
      : [],
  };
};

export const getProductById = async (
  id: string
): Promise<GetSingleProductResponse> => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return {
    ...response.data,
    product: normalizeProduct(response.data?.product),
    reviews: Array.isArray(response.data?.reviews)
      ? response.data.reviews.map(normalizeReview)
      : [],
  };
};

export const createProduct = async (
  productData: Omit<
    Product,
    "_id" | "rating" | "numReviews" | "createdAt" | "updatedAt"
  >,
  token: string
): Promise<CreateProductResponse> => {
  const response = await axios.post(API_BASE_URL, productData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return {
    ...response.data,
    product: normalizeProduct(response.data?.product),
  };
};

export const updateProduct = async (
  id: string,
  productData: Partial<Product>,
  token: string
) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, productData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return {
    ...response.data,
    product: response.data?.product ? normalizeProduct(response.data.product) : undefined,
  };
};

export const deleteProduct = async (
  id: string,
  token: string
): Promise<DeleteProductResponse> => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
