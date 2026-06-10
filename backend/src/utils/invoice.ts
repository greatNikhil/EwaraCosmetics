const BUSINESS_NAME = process.env.BUSINESS_NAME || "Ewara Fashion pvt. ltd.";
const BUSINESS_EMAIL =
  process.env.SUPPORT_EMAIL ||
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER ||
  "support@ewaraofficial.com";

export type InvoiceItem = {
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type InvoiceAddress = {
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type InvoicePayload = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotalAmount: number;
  discountAmount: number;
  gstAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  shippingAddress?: InvoiceAddress;
  createdAt?: string | Date;
};

export const generateInvoiceNumber = (orderId: string) =>
  `INV-${String(orderId).slice(-8).toUpperCase()}`;

const formatCurrency = (amount: number) => `Rs. ${Number(amount || 0).toFixed(2)}`;
const formatPdfCurrency = (amount: number) =>
  `INR ${Number(amount || 0).toFixed(2)}`;

const formatAddressLine = (address?: InvoiceAddress) => {
  if (!address) return "N/A";

  return [
    address.fullName,
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
    address.phoneNumber ? `Phone: ${address.phoneNumber}` : "",
  ]
    .filter(Boolean)
    .join("<br />");
};

const formatAddressLinesText = (address?: InvoiceAddress) => {
  if (!address) return ["N/A"];

  return [
    address.fullName,
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
    address.phoneNumber ? `Phone: ${address.phoneNumber}` : "",
  ].filter(Boolean) as string[];
};

const sanitizePdfText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\s+/g, " ")
    .trim();

const wrapPdfText = (value: string, maxLength = 82) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLength) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [value];
};

const buildSimplePdf = (lines: string[]) => {
  const pageHeight = 842;
  const leftMargin = 50;
  const topMargin = 790;
  const lineHeight = 16;

  const contentLines = [
    "BT",
    "/F1 11 Tf",
    `${leftMargin} ${topMargin} Td`,
    `${lineHeight} TL`,
  ];

  lines.forEach((line, index) => {
    const safeLine = sanitizePdfText(line);
    if (index === 0) {
      contentLines.push(`(${safeLine}) Tj`);
      return;
    }
    contentLines.push("T*");
    contentLines.push(`(${safeLine}) Tj`);
  });

  contentLines.push("ET");

  const contentStream = contentLines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `<< /Length ${Buffer.byteLength(contentStream, "latin1")} >>\nstream\n${contentStream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
};

export const generateInvoiceHtml = (invoice: InvoicePayload) => {
  const invoiceNumber = generateInvoiceNumber(invoice.orderId);
  const invoiceDate = new Date(invoice.createdAt || new Date()).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const itemsHtml = invoice.items
    .map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      return `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">${formatCurrency(item.price)}</td>
          <td style="text-align:right;">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  const discountRow =
    invoice.discountAmount > 0
      ? `<div class="summary-row"><span>Discount</span><span>- ${formatCurrency(invoice.discountAmount)}</span></div>`
      : "";

  const shippingRow =
    invoice.shippingAmount > 0
      ? `<div class="summary-row"><span>Shipping</span><span>${formatCurrency(invoice.shippingAmount)}</span></div>`
      : `<div class="summary-row"><span>Shipping</span><span>Free</span></div>`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Invoice ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #2f2430; margin: 24px; }
          .container { max-width: 860px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7a1f2b; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 28px; font-weight: 700; color: #7a1f2b; }
          .meta { text-align: right; font-size: 14px; }
          .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .section-title { font-size: 13px; font-weight: 700; color: #7a1f2b; margin-bottom: 8px; text-transform: uppercase; }
          .section-card { background: #faf6f7; border: 1px solid #ead2d8; border-radius: 8px; padding: 16px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { border-bottom: 1px solid #e6dfe2; padding: 12px 10px; font-size: 14px; }
          th { background: #f7e7ea; color: #6d1f30; text-align: left; }
          .summary { margin-left: auto; width: 320px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .summary-total { display: flex; justify-content: space-between; border-top: 2px solid #7a1f2b; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 700; color: #7a1f2b; }
          .footer { margin-top: 32px; font-size: 12px; color: #6f6a70; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="brand">${BUSINESS_NAME}</div>
              <div>${BUSINESS_EMAIL}</div>
            </div>
            <div class="meta">
              <div><strong>Invoice:</strong> ${invoiceNumber}</div>
              <div><strong>Order ID:</strong> ${invoice.orderId}</div>
              <div><strong>Date:</strong> ${invoiceDate}</div>
              <div><strong>Payment:</strong> ${invoice.paymentMethod}</div>
              <div><strong>Transaction ID:</strong> ${invoice.transactionId}</div>
            </div>
          </div>

          <div class="section-grid">
            <div class="section-card">
              <div class="section-title">Bill To</div>
              ${invoice.customerName}<br />
              ${invoice.customerEmail}
            </div>
            <div class="section-card">
              <div class="section-title">Ship To</div>
              ${formatAddressLine(invoice.shippingAddress)}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotalAmount)}</span></div>
            ${discountRow}
            <div class="summary-row"><span>GST</span><span>${formatCurrency(invoice.gstAmount)}</span></div>
            ${shippingRow}
            <div class="summary-total"><span>Total Paid</span><span>${formatCurrency(invoice.totalAmount)}</span></div>
          </div>

          <div class="footer">
            This is an electronically generated invoice and is valid without signature.
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateInvoicePdf = (invoice: InvoicePayload) => {
  const invoiceNumber = generateInvoiceNumber(invoice.orderId);
  const invoiceDate = new Date(invoice.createdAt || new Date()).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const lines: string[] = [
    `${BUSINESS_NAME} - Invoice`,
    `Invoice Number: ${invoiceNumber}`,
    `Order ID: ${invoice.orderId}`,
    `Date: ${invoiceDate}`,
    `Payment Method: ${invoice.paymentMethod}`,
    `Transaction ID: ${invoice.transactionId}`,
    "",
    `Bill To: ${invoice.customerName}`,
    `Email: ${invoice.customerEmail}`,
    "",
    "Shipping Address:",
    ...formatAddressLinesText(invoice.shippingAddress),
    "",
    "Items:",
  ];

  invoice.items.forEach((item, index) => {
    const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
    lines.push(
      `${index + 1}. ${item.name} | Qty: ${item.quantity} | Price: ${formatPdfCurrency(
        item.price
      )} | Total: ${formatPdfCurrency(lineTotal)}`
    );
  });

  lines.push(
    "",
    `Subtotal: ${formatPdfCurrency(invoice.subtotalAmount)}`,
    `Discount: ${formatPdfCurrency(invoice.discountAmount)}`,
    `GST: ${formatPdfCurrency(invoice.gstAmount)}`,
    `Shipping: ${
      invoice.shippingAmount > 0
        ? formatPdfCurrency(invoice.shippingAmount)
        : "Free"
    }`,
    `Total Paid: ${formatPdfCurrency(invoice.totalAmount)}`,
    "",
    "This is an electronically generated invoice and is valid without signature."
  );

  const wrappedLines = lines.flatMap((line) =>
    line ? wrapPdfText(line) : [""]
  );

  return buildSimplePdf(wrappedLines);
};
