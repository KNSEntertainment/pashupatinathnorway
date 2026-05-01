"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setError("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      setIsVerifying(true);
      setError("");

      try {
        const response = await fetch("/api/users/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsVerified(true);
          toast({
            title: "Success",
            description: "Email verified successfully. You can now log in with your new email address.",
          });
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push(`/${locale}/login?message=email-verified`);
          }, 2000);
        } else {
          setError(data.error || "Failed to verify email");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setError("An error occurred during verification");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verify Email Address</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isVerified ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">
                Your email address has been successfully verified. You can now log in with your new email address.
              </p>
              <Button 
                onClick={() => router.push(`/${locale}/login`)}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          ) : error ? (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => router.push(`/${locale}/login`)}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          ) : isVerifying ? (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h2>
              <p className="text-gray-600 mb-4">
                Please wait while we verify your email address.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Initializing...</h2>
              <p className="text-gray-600 mb-4">
                Please wait while we initialize the verification process.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
