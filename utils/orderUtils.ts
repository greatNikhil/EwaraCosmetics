export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  discount?: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  items: OrderItem[];
  status: "placed" | "shipped" | "delivered" | "cancelled";
  date: string;
  deliveryDate?: string;
  totalAmount: number;
  discountAmount?: number;
  gst?: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pin: string;
    phone: string;
  };
  billingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pin: string;
    phone: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
}

export const getOrdersForUser = (
  userEmail: string | null | undefined,
): Order[] => {
  if (!userEmail) return [];

  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(`orders_${userEmail}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveOrder = (
  userEmail: string | null | undefined,
  order: Order,
): void => {
  if (!userEmail || typeof window === "undefined") return;

  const orders = getOrdersForUser(userEmail);
  const existingIndex = orders.findIndex((o) => o.id === order.id);

  if (existingIndex > -1) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }

  localStorage.setItem(`orders_${userEmail}`, JSON.stringify(orders));
};

export const getOrderById = (
  userEmail: string | null | undefined,
  orderId: string,
): Order | null => {
  const orders = getOrdersForUser(userEmail);
  return orders.find((o) => o.id === orderId) || null;
};

export const getAllOrders = (): Array<Order & { userEmail: string }> => {
  if (typeof window === "undefined") return [];

  const orders: Array<Order & { userEmail: string }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith("orders_")) {
      const userEmail = key.replace("orders_", "");
      const stored = localStorage.getItem(key);
      if (!stored) continue;
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((order: Order) => {
            orders.push({ ...order, userEmail });
          });
        }
      } catch {
        continue;
      }
    }
  }
  return orders;
};

export const updateOrder = (
  userEmail: string | null | undefined,
  order: Order,
): void => {
  if (!userEmail || typeof window === "undefined") return;

  const orders = getOrdersForUser(userEmail);
  const index = orders.findIndex((o) => o.id === order.id);
  if (index > -1) {
    orders[index] = order;
    localStorage.setItem(`orders_${userEmail}`, JSON.stringify(orders));
  }
};

export const generateInvoicePDF = (order: Order): void => {
  // This function will generate a PDF using the browser's print dialog
  // For production, integrate with jsPDF library
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${order.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #7a1f2b; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #7a1f2b; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; color: #7a1f2b; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f4e3e1; color: #7a1f2b; font-weight: bold; }
        .total-section { text-align: right; margin-bottom: 20px; }
        .total-row { font-size: 18px; font-weight: bold; color: #7a1f2b; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">EWARA COSMETICS</div>
          <div style="font-size: 14px; color: #666;">Luxury Beauty Store</div>
        </div>

        <div class="invoice-details">
          <div>
            <div class="section">
              <div class="section-title">INVOICE DETAILS</div>
              <div>Invoice #: ${order.invoiceNumber}</div>
              <div>Order ID: ${order.id}</div>
              <div>Date: ${new Date(order.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div>
            <div class="section">
              <div class="section-title">STATUS</div>
              <div style="text-transform: capitalize; color: ${order.status === "delivered" ? "#10b981" : order.status === "cancelled" ? "#ef4444" : "#f59e0b"};">
                ${order.status}
              </div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div>
            <div class="section-title">BILLING ADDRESS</div>
            <div>${order.billingAddress?.name || order.shippingAddress.name}</div>
            <div>${order.billingAddress?.address || order.shippingAddress.address}</div>
            <div>${order.billingAddress?.city || order.shippingAddress.city}, ${order.billingAddress?.state || order.shippingAddress.state}</div>
            <div>${order.billingAddress?.pin || order.shippingAddress.pin}</div>
          </div>
          <div>
            <div class="section-title">SHIPPING ADDRESS</div>
            <div>${order.shippingAddress.name}</div>
            <div>${order.shippingAddress.address}</div>
            <div>${order.shippingAddress.city}, ${order.shippingAddress.state}</div>
            <div>${order.shippingAddress.pin}</div>
            <div>Phone: ${order.shippingAddress.phone}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          ${order.discountAmount ? `<div>Discount: -₹${order.discountAmount.toFixed(2)}</div>` : ""}
          ${order.gst ? `<div>GST (18%): ₹${order.gst.toFixed(2)}</div>` : ""}
          <div class="total-row">Total Amount: ₹${order.totalAmount.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase! For support, contact us at support@ewara.com</p>
          <p>This is an electronically generated invoice and is valid without signature.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
  printWindow.print();
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "delivered":
      return "#10b981";
    case "shipped":
      return "#f59e0b";
    case "placed":
      return "#3b82f6";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

export const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};
