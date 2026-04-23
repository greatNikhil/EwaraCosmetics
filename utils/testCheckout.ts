/**
 * TEST UTILITY FOR CHECKOUT MODAL
 *
 * Run these commands in the browser console to test the checkout modal:
 */

// Add test items to cart
export function addTestItemsToCart() {
  const testItems = [
    {
      id: 1,
      name: "Luxury Hydration Serum",
      price: 1599,
      image: "/Product/product1.jpg",
      qty: 1,
    },
    {
      id: 2,
      name: "Rose Gold Moisturizer",
      price: 1299,
      image: "/Product/product2.jpg",
      qty: 2,
    },
  ];

  localStorage.setItem("cart", JSON.stringify(testItems));
  console.log("✅ Added test items to cart");
  console.log("Items:", testItems);

  // Dispatch event to update UI
  window.dispatchEvent(new Event("storage"));
}

// Clear cart
export function clearCart() {
  localStorage.setItem("cart", "[]");
  console.log("✅ Cart cleared");
  window.dispatchEvent(new Event("storage"));
}

// Add test user data
export function addTestUser() {
  const testUser = {
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
  };

  localStorage.setItem("userData", JSON.stringify(testUser));
  localStorage.setItem("isLoggedIn", "true");
  console.log("✅ Test user added");
  console.log("User:", testUser);

  window.dispatchEvent(new Event("userChanged"));
}

// Test checkout flow
export function testCheckoutFlow() {
  addTestUser();
  addTestItemsToCart();

  console.log("✅ Test setup complete!");
  console.log("1. Open the bag drawer (shopping bag icon)");
  console.log("2. Click 'CHECKOUT →' button");
  console.log("3. Checkout modal should open");
  console.log("4. Try different payment options");
  console.log("5. Click 'Place Order' to complete");
}

// Export for global use
if (typeof window !== "undefined") {
  (window as any).addTestItemsToCart = addTestItemsToCart;
  (window as any).clearCart = clearCart;
  (window as any).addTestUser = addTestUser;
  (window as any).testCheckoutFlow = testCheckoutFlow;
}
