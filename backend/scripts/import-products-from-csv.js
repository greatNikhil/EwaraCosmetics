const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { DataTypes, Sequelize } = require("sequelize");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const FALLBACK_IMAGE = "/favicon/product.jpeg";
const PUBLIC_DIR = path.resolve(__dirname, "..", "..", "public");
const IMAGE_TOKEN_BLACKLIST = new Set([
  "ewara",
  "product",
  "products",
  "image",
  "img",
  "jpeg",
  "jpg",
  "png",
  "webp",
  "wa",
]);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
  }
);

const Product = sequelize.define(
  "ProductImport",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortDescription: {
      type: DataTypes.STRING(300),
      defaultValue: "",
    },
    brand: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discountPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    countInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    numReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
  }
);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {
    file: "",
    mode: "upsert",
    validateOnly: false,
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
      continue;
    }

    if (arg === "--validate-only") {
      parsed.validateOnly = true;
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
  rating: 0,
  numReviews: 0,
});

const toComparableTokens = (value) =>
  String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !IMAGE_TOKEN_BLACKLIST.has(token));

const validateImageMappings = (product) => {
  const warnings = [];
  const slugTokens = toComparableTokens(product.slug);

  for (const image of product.images) {
    if (!image || image === FALLBACK_IMAGE) {
      continue;
    }

    const relativeImagePath = image.replace(/^\/+/, "").replace(/\//g, path.sep);
    const absoluteImagePath = path.resolve(PUBLIC_DIR, relativeImagePath);

    if (!absoluteImagePath.startsWith(PUBLIC_DIR)) {
      warnings.push(`image path escapes public directory: ${image}`);
      continue;
    }

    if (!fs.existsSync(absoluteImagePath)) {
      warnings.push(`image file not found: ${image}`);
      continue;
    }

    const imageTokens = toComparableTokens(image);
    const hasTokenMatch =
      slugTokens.length === 0 ||
      slugTokens.some((token) => imageTokens.includes(token));

    if (!hasTokenMatch) {
      warnings.push(`possible mismatch between slug "${product.slug}" and image "${image}"`);
    }
  }

  return warnings;
};

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
  const { file, mode, validateOnly } = parseArgs();

  if (!file) {
    console.error("Missing --file argument");
    process.exit(1);
  }

  const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"];
  const missingEnvVars = requiredEnvVars.filter(
    (name) => !process.env[name] || !String(process.env[name]).trim()
  );

  if (missingEnvVars.length > 0) {
    console.error(`Missing database env vars in backend/.env: ${missingEnvVars.join(", ")}`);
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

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let warned = 0;

  if (!validateOnly) {
    await sequelize.authenticate();
    await Product.sync();
  }

  try {
    for (const row of rows) {
      const product = normalizeProductRow(row);
      const missing = validateProduct(product);
      const imageWarnings = validateImageMappings(product);

      if (missing.length > 0) {
        skipped += 1;
        console.warn(
          `Skipped row for slug "${product.slug || "unknown"}": missing/invalid ${missing.join(", ")}`
        );
        continue;
      }

      if (imageWarnings.length > 0) {
        warned += 1;
        console.warn(`Image warnings for slug "${product.slug}": ${imageWarnings.join("; ")}`);
      }

      if (validateOnly) {
        continue;
      }

      const payload = {
        ...product,
        images: JSON.stringify(product.images),
      };

      const existing = await Product.findOne({ where: { slug: product.slug } });

      if (existing && mode === "insert") {
        skipped += 1;
        console.warn(`Skipped existing slug in insert mode: ${product.slug}`);
        continue;
      }

      if (existing) {
        await existing.update(payload);
        updated += 1;
      } else {
        await Product.create(payload);
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
          warned,
          validateOnly,
        },
        null,
        2
      )
    );
  } finally {
    if (!validateOnly) {
      await sequelize.close();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
