/**
 * PAGE MIGRATION GUIDE
 * ====================
 * 
 * This file shows how to migrate your existing pages from Base44 to Supabase.
 * 
 * STEP 1: Move page files from /Pages to /src/pages
 * STEP 2: Update imports as shown below
 * STEP 3: Update navigation (createPageUrl -> useNavigate)
 * STEP 4: Test each page individually
 * 
 * IMPORT CHANGES:
 * ---------------
 * 
 * BEFORE (Base44):
 * import { User } from "@/entities/User";
 * import { Business } from "@/entities/Business";
 * import { createPageUrl } from "@/utils";
 * import { InvokeLLM, UploadFile, SendEmail } from "npm:@base44/sdk";
 * 
 * AFTER (Supabase):
 * import { User } from "@/entities/User";
 * import { Business } from "@/entities/Business";
 * import { useNavigate } from "react-router-dom";
 * import { UploadFile, convertCurrency, SendEmail } from "@/integrations/Core";
 * 
 * NAVIGATION CHANGES:
 * -------------------
 * 
 * BEFORE:
 * window.location.href = createPageUrl("BusinessDetail", { id: business.id });
 * 
 * AFTER:
 * const navigate = useNavigate();
 * navigate(`/business/${business.id}`);
 * 
 * ROUTE MAPPING:
 * --------------
 * "Home" -> "/"
 * "Businesses" -> "/businesses"
 * "BusinessDetail" -> "/business/:id"
 * "Jobs" -> "/jobs"
 * "JobDetail" -> "/job/:id"
 * "Events" -> "/events"
 * "EventDetail" -> "/event/:id"
 * "Marketplace" -> "/marketplace"
 * "MarketplaceItemDetail" -> "/marketplace/:id"
 * "Profile" -> "/profile"
 * "Notifications" -> "/notifications"
 * "GetCash" -> "/get-cash"
 * "GetRide" -> "/get-ride"
 * "Community" -> "/community"
 * "AdminDashboard" -> "/admin"
 * "Welcome" -> "/welcome"
 * 
 * ENTITY USAGE:
 * -------------
 * The entity wrappers maintain the same API signature:
 * 
 * // Create
 * await Business.create({ name: "My Business", ... });
 * 
 * // Read
 * const businesses = await Business.list();
 * const business = await Business.get(id);
 * 
 * // Update
 * await Business.update(id, { name: "Updated Name" });
 * 
 * // Delete
 * await Business.delete(id);
 * 
 * // Filter
 * const approved = await Business.filter({ status: "approved" });
 * 
 * AUTH USAGE:
 * -----------
 * Instead of UserEntity.me(), use the AuthContext:
 * 
 * import { useAuth } from "@/contexts/AuthContext";
 * 
 * function MyComponent() {
 *   const { user, profile, signIn, signOut, isAdmin } = useAuth();
 *   // ...
 * }
 */

export default function MigrationGuide() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Page Migration Guide</h1>
      <p className="text-gray-600 mb-8">
        See the comments in this file for detailed migration instructions.
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          <strong>Note:</strong> This is a placeholder file. Move your actual pages 
          from the /Pages folder to /src/pages and update the imports as described above.
        </p>
      </div>
    </div>
  );
}
