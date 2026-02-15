/**
 * Route mapping from old Base44 page names to new routes
 */
const routeMap = {
  'Home': '/',
  'Welcome': '/welcome',
  'Login': '/login',
  'Signup': '/signup',
  'ForgotPassword': '/forgot-password',
  'CompleteSignup': '/complete-signup',
  'RolePending': '/role-pending',
  'Profile': '/profile',
  'Notifications': '/notifications',
  'Businesses': '/businesses',
  'BusinessDetail': '/business',
  'AddBusiness': '/add-business',
  'EditBusiness': '/edit-business',
  'Jobs': '/jobs',
  'JobDetail': '/job',
  'PostJob': '/post-job',
  'Events': '/events',
  'EventDetail': '/event',
  'AddEvent': '/add-event',
  'EditEvent': '/edit-event',
  'Marketplace': '/marketplace',
  'MarketplaceItemDetail': '/marketplace',
  'Sellitem': '/sell-item',
  'SellItem': '/sell-item',
  'Community': '/community',
  'Donations': '/donations',
  'LostAndFound': '/lost-and-found',
  'ReportLostItem': '/report-lost-item',
  'EmergencyServices': '/emergency-services',
  'UAEHelpCenter': '/uae-help',
  'GetCash': '/get-cash',
  'GetRide': '/get-ride',
  'UtilityTools': '/utility-tools',
  'Subscribe': '/subscribe',
  'PromoteContent': '/promote',
  'VendorDashboard': '/vendor-dashboard',
  'MoneyAgentDashboard': '/agent-dashboard',
  'DriverDashboard': '/driver-dashboard',
  'AdminDashboard': '/admin',
  'AdminUserManagement': '/admin/users',
  'AdminBusinessManagement': '/admin/businesses',
  'AdminContentManagement': '/admin/content',
  'AdminPromotions': '/admin/promotions',
  'AdminSubscriptionManagement': '/admin/subscriptions',
  'AdminSiteContent': '/admin/site-content',
  'AdminUAEHelpCenter': '/admin/uae-help-center',
  'AdminAppSettings': '/admin/settings',
  'PrivacyPolicy': '/privacy-policy',
  'Agreements': '/agreements',
  'AboutUs': '/about',
};

/**
 * Create a URL for a page with optional query parameters
 * Replaces Base44's createPageUrl utility - maintains backward compatibility
 */
export function createPageUrl(pageName, params = {}) {
  // Handle query string style: "PageName?id=123"
  let actualPageName = pageName;
  let queryParams = { ...params };
  
  if (pageName.includes('?')) {
    const [name, queryString] = pageName.split('?');
    actualPageName = name;
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      queryParams[key] = value;
    });
  }
  
  // Get the mapped route or convert to lowercase kebab-case
  let path = routeMap[actualPageName];
  if (!path) {
    // Fallback: convert PascalCase to kebab-case
    path = '/' + actualPageName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  
  // Handle ID params for detail pages
  if (queryParams.id && (path.includes('/business') || path.includes('/job') || path.includes('/event') || path.includes('/marketplace'))) {
    path = `${path}/${queryParams.id}`;
    delete queryParams.id;
  }
  
  // Build remaining query string
  const remainingParams = Object.keys(queryParams).length > 0
    ? '?' + new URLSearchParams(queryParams).toString()
    : '';
  
  return `${path}${remainingParams}`;
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(amount, currency = 'AED') {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Generate a random reference ID
 */
export function generateReferenceId(prefix = 'CL') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
