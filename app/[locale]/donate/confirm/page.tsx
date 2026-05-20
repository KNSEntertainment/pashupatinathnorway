"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Link } from "@/i18n/navigation";

interface DonationDetails {
  amount: number;
  paymentStatus: string;
  taxId: string;
  id: string;
  donorName: string;
  donorEmail: string;
  causeTitle: string;
  message?: string;
}

export default function DonationConfirmPage() {
  const t = useTranslations("donation");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [donationDetails, setDonationDetails] = useState<DonationDetails | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const confirmDonation = async () => {
      const reference = searchParams.get('reference');
      const orderId = searchParams.get('orderId');

      if (!reference || !orderId) {
        setStatus('error');
        setError("Missing payment information");
        return;
      }

      // Get donation data from sessionStorage (stored during payment initiation)
      const donationData = sessionStorage.getItem(`donation_${reference}`);
      
      if (!donationData) {
        setStatus('error');
        setError("Donation data not found");
        return;
      }

      try {
        const parsedDonationData = JSON.parse(donationData);
        
        // Confirm the payment with the server
        const response = await fetch('/api/vipps/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            reference,
            donationData: parsedDonationData,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setDonationDetails(result.donation);
          setStatus('success');
          toast.success("Donation completed successfully!");
          
          // Clear the stored donation data
          sessionStorage.removeItem(`donation_${reference}`);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setError(errorData.error || "Failed to confirm donation");
          toast.error(errorData.error || "Failed to confirm donation");
        }
      } catch (error) {
        console.error('Error confirming donation:', error);
        setStatus('error');
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      }
    };

    confirmDonation();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-brand_primary" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("confirming_donation") || "Confirming your donation..."}
              </h2>
              <p className="text-gray-600 text-center">
                {t("please_wait") || "Please wait while we process your payment."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("donation_failed") || "Donation Failed"}
              </h2>
              <p className="text-gray-600 text-center">
                {error || t("donation_error_description") || "There was an error processing your donation."}
              </p>
              <div className="space-y-2 w-full">
                <Link href="/donate">
                  <Button className="w-full">
                    {t("try_again") || "Try Again"}
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    {t("go_home") || "Go Home"}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t("donation_successful") || "Thank You!"}
            </h2>
            <p className="text-gray-600 text-center">
              {t("donation_success_description") || "Your donation has been successfully processed."}
            </p>
            
            {donationDetails && (
              <div className="w-full space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("amount") || "Amount"}:</span>
                  <span className="font-semibold">NOK {donationDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("status") || "Status"}:</span>
                  <span className="font-semibold text-green-600">
                    {donationDetails.paymentStatus}
                  </span>
                </div>
                {donationDetails.taxId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("tax_id") || "Tax ID"}:</span>
                    <span className="font-semibold">{donationDetails.taxId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("transaction_id") || "Transaction ID"}:</span>
                  <span className="font-mono text-sm">{donationDetails.id}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 w-full">
              <Link href="/donate">
                <Button variant="outline" className="w-full">
                  {t("make_another_donation") || "Make Another Donation"}
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full">
                  {t("go_home") || "Go Home"}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
