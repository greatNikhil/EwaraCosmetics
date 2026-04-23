/**
 * SAMPLE DATA GENERATOR FOR TESTING
 *
 * Run this in the browser console to create sample orders
 * First, make sure you're logged in with an email
 */

export function createSampleOrders() {
  // Get current user email
  const userData = localStorage.getItem("userData");
  if (!userData) {
    alert("Please login first!");
    return;
  }

  const user = JSON.parse(userData);
  const userEmail = user.email || user.phone;

  if (!userEmail) {
    alert("User email/phone not found!");
    return;
  }

  // Sample orders
  const sampleOrders = [
    {
      id: "ORD-2026-001",
      invoiceNumber: "INV-2026-001",
      items: [
        {
          id: "1",
          productId: "prod-luxury-serum",
          productName: "Hydration Boost Facial Serum",
          imageUrl: "/Product/product1.jpg",
          price: 1599,
          quantity: 1,
          discount: 0,
        },
      ],
      status: "delivered",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryDate: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      totalAmount: 1599,
      discountAmount: 0,
      gst: 287,
      shippingAddress: {
        name: user.name || "Customer",
        address: "123 Luxury Lane, Premium District",
        city: "Delhi",
        state: "Delhi",
        pin: "110001",
        phone: user.phone || "9876543210",
      },
      billingAddress: {
        name: user.name || "Customer",
        address: "123 Luxury Lane, Premium District",
        city: "Delhi",
        state: "Delhi",
        pin: "110001",
        phone: user.phone || "9876543210",
      },
      paymentMethod: "Credit Card",
      trackingNumber: "TRK2026001",
    },
    {
      id: "ORD-2026-002",
      invoiceNumber: "INV-2026-002",
      items: [
        {
          id: "2",
          productId: "prod-lipstick",
          productName: "Velvet Matte Lipstick - Maroon Bliss",
          imageUrl: "/Product/product2.jpg",
          price: 599,
          quantity: 2,
          discount: 100,
        },
      ],
      status: "shipped",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryDate: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      totalAmount: 1198,
      discountAmount: 100,
      gst: 214,
      shippingAddress: {
        name: user.name || "Customer",
        address: "123 Luxury Lane, Premium District",
        city: "Delhi",
        state: "Delhi",
        pin: "110001",
        phone: user.phone || "9876543210",
      },
      billingAddress: {
        name: user.name || "Customer",
        address: "123 Luxury Lane, Premium District",
        city: "Delhi",
        state: "Delhi",
        pin: "110001",
        phone: user.phone || "9876543210",
      },
      paymentMethod: "Debit Card",
      trackingNumber: "TRK2026002",
    },
    {
      id: "ORD-2026-003",
      invoiceNumber: "INV-2026-003",
      items: [
        {
          id: "3",
          productId: "prod-moisturizer",
          productName: "Rose Gold Moisturizing Cream",
          imageUrl: "/Product/product3.jpg",
          price: 1299,
          quantity: 1,
          discount: 0,
        },
        {
          id: "4",
          productId: "prod-mask",
          productName: "Deep Cleansing Face Mask",
          imageUrl: "/Product/product4.jpg",
          price: 799,
          quantity: 1,
          discount: 0,
        },
      ],
      status: "placed",
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      deliveryDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      totalAmount: 2098,
      discountAmount: 0,
      gst: 377,
      shippingAddress: {
        name: user.name || "Customer",
        address: "123 Luxury Lane, Premium District",
        city: "Delhi",
        state: "Delhi",
        pin: "110001",
        phone: user.phone || "9876543210",
      },
      billingAddress: {
        name: user.name || "Customer",
        address: "123 Luxury Lane, Premium District",
        city: "Delhi",
        state: "Delhi",
        pin: "110001",
        phone: user.phone || "9876543210",
      },
      paymentMethod: "UPI",
      trackingNumber: "TRK2026003",
    },
  ];

  // Save to localStorage
  localStorage.setItem(`orders_${userEmail}`, JSON.stringify(sampleOrders));

  // Dispatch event to update UI
  window.dispatchEvent(new Event("storage"));

  console.log(
    `✅ Created ${sampleOrders.length} sample orders for ${userEmail}`,
  );
  alert(`✅ Sample orders created! Refresh the page to see them.`);
}

// Export for use
if (typeof window !== "undefined") {
  (window as any).createSampleOrders = createSampleOrders;
}
