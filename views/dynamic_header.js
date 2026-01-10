// Dynamic Navigation Script - Include this in all pages
// Add this script to the <head> or before closing </body> tag

function createNavigation(currentPage = '') {
  return `
    <nav class="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between py-4">
          <a href="/" class="text-2xl md:text-3xl font-bold mb-3 md:mb-0">🍔 Food Ordering</a>
          <div id="navLinks" class="flex flex-wrap gap-2 md:gap-1">
            <div class="px-4 py-2 text-green-200">Loading...</div>
          </div>
        </div>
      </div>
    </nav>
  `;
}

async function loadNavigation(currentPage = '') {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;
  
  try {
    // Check if user is logged in by calling an API endpoint
    const res = await fetch('/api/auth/me');
    
    if (res.ok) {
      const user = await res.json();
      
      // Helper function to mark active page
      const isActive = (page) => currentPage === page ? 'bg-green-500 font-medium' : 'hover:bg-green-500';
      
      if (user.role === 'admin') {
        // Admin navigation
        navLinks.innerHTML = `
          <a href="/" class="px-4 py-2 rounded-lg ${isActive('home')} transition-colors duration-200">Home</a>
          <a href="/menu" class="px-4 py-2 rounded-lg ${isActive('menu')} transition-colors duration-200">Menu</a>
          <a href="/admin/products" class="px-4 py-2 rounded-lg ${isActive('admin-products')} transition-colors duration-200">Products</a>
          <a href="/admin/orders" class="px-4 py-2 rounded-lg ${isActive('admin-orders')} transition-colors duration-200">Orders</a>
          <div class="relative group">
            <button class="px-4 py-2 rounded-lg hover:bg-green-500 transition-colors duration-200 flex items-center gap-1">
              ${user.name} <span class="text-xs">▼</span>
            </button>
            <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <a href="/profile" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</a>
              <a href="#" onclick="logout(event)" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</a>
            </div>
          </div>
        `;
      } else {
        // Customer navigation
        navLinks.innerHTML = `
          <a href="/" class="px-4 py-2 rounded-lg ${isActive('home')} transition-colors duration-200">Home</a>
          <a href="/menu" class="px-4 py-2 rounded-lg ${isActive('menu')} transition-colors duration-200">Menu</a>
          <a href="/orders" class="px-4 py-2 rounded-lg ${isActive('orders')} transition-colors duration-200">My Orders</a>
          <div class="relative group">
            <button class="px-4 py-2 rounded-lg hover:bg-green-500 transition-colors duration-200 flex items-center gap-1">
              ${user.name} <span class="text-xs">▼</span>
            </button>
            <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <a href="/profile" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</a>
              <a href="/orders" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Order History</a>
              <a href="#" onclick="logout(event)" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</a>
            </div>
          </div>
        `;
      }
    } else {
      // User is not logged in - show public navigation
      const isActive = (page) => currentPage === page ? 'bg-green-500 font-medium' : 'hover:bg-green-500';
      
      navLinks.innerHTML = `
        <a href="/" class="px-4 py-2 rounded-lg ${isActive('home')} transition-colors duration-200">Home</a>
        <a href="/menu" class="px-4 py-2 rounded-lg ${isActive('menu')} transition-colors duration-200">Menu</a>
        <a href="/login" class="px-4 py-2 rounded-lg ${isActive('login')} transition-colors duration-200">Login</a>
        <a href="/register" class="px-4 py-2 rounded-lg ${isActive('register')} transition-colors duration-200">Register</a>
      `;
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Error or not logged in - show public navigation
    const isActive = (page) => currentPage === page ? 'bg-green-500 font-medium' : 'hover:bg-green-500';
    
    navLinks.innerHTML = `
      <a href="/" class="px-4 py-2 rounded-lg ${isActive('home')} transition-colors duration-200">Home</a>
      <a href="/menu" class="px-4 py-2 rounded-lg ${isActive('menu')} transition-colors duration-200">Menu</a>
      <a href="/login" class="px-4 py-2 rounded-lg ${isActive('login')} transition-colors duration-200">Login</a>
      <a href="/register" class="px-4 py-2 rounded-lg ${isActive('register')} transition-colors duration-200">Register</a>
    `;
  }
}

async function logout(event) {
  if (event) event.preventDefault();
  
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = '/login';
  }
}

// Auto-load navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadNavigation());
} else {
  loadNavigation();
}