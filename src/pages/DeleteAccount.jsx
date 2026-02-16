import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteAccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await User.deleteAccount();
      // Sign out and redirect
      await signOut();
      navigate(createPageUrl("Welcome"));
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Failed to delete account. Please contact support.");
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Profile")}>
            <Button variant="outline" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Account Deletion</h1>
        </div>

        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Account deletion is permanent and cannot be undone. Please ensure you want to delete your account before proceeding.
            </AlertDescription>
          </Alert>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Trash2 className="w-5 h-5" />
                Delete Your Account
              </CardTitle>
              <CardDescription className="text-red-800">
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="confirm-text" className="text-red-900 font-semibold">
                    Type <strong>DELETE</strong> to confirm account deletion:
                  </Label>
                  <Input
                    id="confirm-text"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="mt-2"
                    disabled={isDeleting}
                  />
                </div>

                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={confirmText !== 'DELETE' || isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers. You will lose:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Your profile and personal information</li>
                          <li>All your posts, listings, and content</li>
                          <li>Your messages and communications</li>
                          <li>All your preferences and settings</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Yes, Delete My Account'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg mb-2">Alternative: Contact Support</h3>
                <p className="mb-3 text-sm">You can also request account deletion by contacting our support team:</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <a 
                    href="mailto:support@cashlink.business" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    support@cashlink.business
                  </a>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Please include your account email address in your request.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Gets Deleted</CardTitle>
              <CardDescription>
                Upon account deletion, the following information will be permanently removed:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Profile information</strong> - Your name, email, phone number, and profile details</li>
                <li><strong>User-generated content</strong> - Your posts, job listings, event listings, marketplace items, and business listings</li>
                <li><strong>Personal data</strong> - All personal information associated with your account</li>
                <li><strong>Messages and communications</strong> - Your chat history and messages</li>
                <li><strong>Preferences and settings</strong> - Your app preferences and saved settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Retain</CardTitle>
              <CardDescription>
                For legal compliance and regulatory requirements, we may retain certain information:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Transaction records</strong> - Financial transaction records are retained for 7 years as required by UAE regulations</li>
                <li><strong>Legal records</strong> - Information required for legal compliance, dispute resolution, or enforcement of our terms</li>
                <li><strong>Anonymized data</strong> - Aggregated, anonymized data that cannot be used to identify you</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                All retained data is kept securely and used only for legal and compliance purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-3">
                If you have questions about account deletion or need assistance, please contact our support team:
              </p>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <a 
                  href="mailto:support@cashlink.business" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  support@cashlink.business
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
