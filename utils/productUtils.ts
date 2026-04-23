export interface Product {
  id: number;
  title: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  stock: number;
  images: string[];
  isNew: boolean;
  isBestSeller: boolean;
  createdAt: string;
}

const dummyProducts: Product[] = [
  {
    id: 1,
    title: "Ubtan Glow Facewash",
    brand: "Ewara",
    description: "A gentle glow face wash for daily hydration.",
    price: 299,
    originalPrice: 399,
    discount: 25,
    category: "skincare",
    stock: 120,
    images: ["/favicon/product.jpeg", "/favicon/product.jpeg"],
    isNew: true,
    isBestSeller: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Vitamin C Serum",
    brand: "Ewara",
    description: "Brightening serum with natural Vitamin C.",
    price: 499,
    originalPrice: 699,
    discount: 29,
    category: "skincare",
    stock: 80,
    images: ["/favicon/product.jpeg", "/favicon/product.jpeg"],
    isNew: false,
    isBestSeller: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Hydrating Moisturizer",
    brand: "Ewara",
    description: "Nourishing moisturizer for supple skin.",
    price: 399,
    originalPrice: 499,
    discount: 20,
    category: "skincare",
    stock: 95,
    images: ["/favicon/product.jpeg", "/favicon/product.jpeg"],
    isNew: true,
    isBestSeller: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Aloe Vera Gel",
    brand: "Ewara",
    description: "Soothing gel for sensitive skin.",
    price: 199,
    originalPrice: 249,
    discount: 20,
    category: "skincare",
    stock: 140,
    images: ["/favicon/product.jpeg", "/favicon/product.jpeg"],
    isNew: false,
    isBestSeller: true,
    createdAt: new Date().toISOString(),
  },
];

const PRODUCTS_KEY = "products";

const isBrowser = typeof window !== "undefined";

export const getProducts = (): Product[] => {
  if (!isBrowser) return dummyProducts;

  const stored = window.localStorage.getItem(PRODUCTS_KEY);
  if (!stored) return dummyProducts;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : dummyProducts;
  } catch {
    return dummyProducts;
  }
};

const saveProducts = (products: Product[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const addProduct = (product: Product) => {
  if (!isBrowser) return;
  const products = getProducts();
  saveProducts([product, ...products]);
};

export const updateProduct = (updatedProduct: Product) => {
  if (!isBrowser) return;
  const products = getProducts().map((product) =>
    product.id === updatedProduct.id ? updatedProduct : product,
  );
  saveProducts(products);
};

export const deleteProduct = (id: number) => {
  if (!isBrowser) return;
  const products = getProducts().filter((product) => product.id !== id);
  saveProducts(products);
};

export const getProductById = (id: number) => {
  return getProducts().find((product) => product.id === id) || null;
};
