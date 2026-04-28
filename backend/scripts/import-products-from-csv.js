const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const FALLBACK_IMAGE = "/favicon/product.jpeg";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true, default: "" },
    brand: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    countInStock: { type: Number, required: true, min: 0, default: 0 },
    images: {
      type: [String],
      required: true,
      default: [FALLBACK_IMAGE],
    },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.ProductImport ||
  mongoose.model("ProductImport", productSchema, "products");

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {
    file: "",
    mode: "upsert",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--file") {
      parsed.file = args[index + 1] || "";
      index += 1;
      continue;
    }

    if (arg === "--mode") {
      parsed.mode = args[index + 1] || "upsert";
      index += 1;
    }
  }

  return parsed;
};

const parseCsv = (raw) => {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(current);
      current = "";

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    current += char;
  }

  if (current !== "" || row.length > 0) {
    row.push(current);
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((value) => value.trim());
  return rows.slice(1).map((values) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = values[index] !== undefined ? values[index].trim() : "";
    });
    return item;
  });
};

const normalizeImages = (value) => {
  if (!value) {
    return [FALLBACK_IMAGE];
  }

  const images = String(value)
    .split("|")
    .map((image) => image.trim())
    .filter(Boolean);

  return images.length > 0 ? images : [FALLBACK_IMAGE];
};

const normalizeBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
};

const normalizeNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeProductRow = (row) => ({
  name: String(row.name || "").trim(),
  slug: String(row.slug || "")
    .trim()
    .toLowerCase(),
  brand: String(row.brand || "").trim(),
  category: String(row.category || "").trim(),
  description: String(row.description || "").trim(),
  shortDescription: String(row.shortDescription || "").trim(),
  price: normalizeNumber(row.price),
  originalPrice: normalizeNumber(row.originalPrice),
  discountPercent: normalizeNumber(row.discountPercent),
  countInStock: normalizeNumber(row.countInStock),
  images: normalizeImages(row.images),
  isFeatured: normalizeBoolean(row.isFeatured, false),
  isPublished: normalizeBoolean(row.isPublished, true),
});

const validateProduct = (product) => {
  const missing = [];

  if (!product.name) missing.push("name");
  if (!product.slug) missing.push("slug");
  if (!product.category) missing.push("category");
  if (!product.description) missing.push("description");
  if (product.price <= 0) missing.push("price");
  if (product.countInStock < 0) missing.push("countInStock");

  return missing;
};

async function main() {
  const { file, mode } = parseArgs();

  if (!file) {
    console.error("Missing --file argument");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Missing MONGO_URI in backend/.env");
    process.exit(1);
  }

  const resolvedFile = path.resolve(file);
  if (!fs.existsSync(resolvedFile)) {
    console.error(`CSV file not found: ${resolvedFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolvedFile, "utf8");
  const rows = parseCsv(raw);

  if (rows.length === 0) {
    console.error("No product rows found in CSV");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    for (const row of rows) {
      const product = normalizeProductRow(row);
      const missing = validateProduct(product);

      if (missing.length > 0) {
        skipped += 1;
        console.warn(
          `Skipped row for slug "${product.slug || "unknown"}": missing/invalid ${missing.join(", ")}`
        );
        continue;
      }

      const existing = await Product.findOne({ slug: product.slug });

      if (existing && mode === "insert") {
        skipped += 1;
        console.warn(`Skipped existing slug in insert mode: ${product.slug}`);
        continue;
      }

      if (existing) {
        await Product.updateOne({ slug: product.slug }, { $set: product });
        updated += 1;
      } else {
        await Product.create(product);
        created += 1;
      }
    }

    console.log(
      JSON.stringify(
        {
          file: resolvedFile,
          rows: rows.length,
          created,
          updated,
          skipped,
        },
        null,
        2
      )
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
