"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MailMinus, MailPlus, AlertCircle, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [resubscribing, setResubscribing] = useState(false);
  const [reason, setReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResubscribeSuccess, setShowResubscribeSuccess] = useState(false);
  const { toast } = useToast();

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/check-subscription?email=${encodeURIComponent(email || '')}`);
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    checkSubscriptionStatus();
  }, [email, checkSubscriptionStatus]);

  const handleUnsubscribe = async () => {
    setUnsubscribing(true);
    try {
      const response = await fetch('/api/public/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          reason: reason,
        }),
      });

      if (response.ok) {
        await response.json(); // Consume the response
        setIsSubscribed(false);
        setShowSuccess(true);
        toast({
          title: "Successfully Unsubscribed",
          description: "You have been removed from our mailing list.",
        });
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUnsubscribing(false);
    }
  };

  const handleResubscribe = async () => {
    setResubscribing(true);
    try {
      const response = await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (response.ok) {
        await response.json(); // Consume the response
        setIsSubscribed(true);
        setShowResubscribeSuccess(true);
        setShowSuccess(false);
        setReason("");
        toast({
          title: "Successfully Resubscribed",
          description: "Welcome back! You'll receive our updates again.",
        });
      } else {
        throw new Error('Failed to resubscribe');
      }
    } catch (error) {
      console.error('Resubscribe error:', error);
      toast({
        title: "Error",
        description: "Failed to resubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
              <p className="text-gray-600">This unsubscribe link is invalid or missing email information.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Newsletter Subscription</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              Email: <span className="font-medium">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isSubscribed ? "You are currently subscribed" : "You are not subscribed"}
            </p>
          </div>

          {showSuccess ? (
            <Alert className="bg-orange-50 border-orange-200">
              <MailMinus className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="space-y-2">
                  <p className="font-medium">Successfully Unsubscribed</p>
                  <p className="text-sm">We&apos;re sorry to see you go! You have been removed from our mailing list.</p>
                  {reason && (
                    <p className="text-sm italic">Thank you for your feedback.</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : showResubscribeSuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <MailPlus className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-medium">Welcome Back!</p>
                  <p className="text-sm">You have been resubscribed to our newsletter. We&apos;re glad to have you back!</p>
                </div>
              </AlertDescription>
            </Alert>
          ) : isSubscribed ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Are you sure you want to unsubscribe from our newsletter? You&apos;ll miss out on important updates, events, and announcements.
                </AlertDescription>
              </Alert>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for unsubscribing (optional)
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Help us improve by letting us know why you're unsubscribing..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUnsubscribe}
                disabled={unsubscribing}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {unsubscribing ? "Unsubscribing..." : "Unsubscribe"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <MailPlus className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You are currently not subscribed to our newsletter. Would you like to receive updates about our events and activities?
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleResubscribe}
                disabled={resubscribing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {resubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          )}

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Heart className="w-4 h-4" />
              Thank you for being part of our community
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
