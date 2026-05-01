"use client";

import React from "react";
import useFetchData from "@/hooks/useFetchData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Gift, Mail, Phone, User, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface BirthdayMember {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    profilePhoto?: string;
    membershipType: string;
    birthDate: string;
    daysUntilBirthday: number;
    age: number;
    fullName: string;
}

export default function UpcomingBirthdays() {
    const { data: birthdays, error, loading, mutate } = useFetchData("/api/membership/upcoming-birthdays", "data");
    const { toast } = useToast();

    // Debug logging
    console.log("UpcomingBirthdays Debug:");
    console.log("- Loading:", loading);
    console.log("- Error:", error);
    console.log("- Birthdays data:", birthdays);
    console.log("- Birthdays length:", birthdays?.length);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric"
        });
    };

    const getDaysText = (days: number) => {
        if (days === 0) return "Today";
        if (days === 1) return "Tomorrow";
        return `In ${days} days`;
    };

    const getDaysColor = (days: number) => {
        if (days === 0) return "bg-red-500 text-white";
        if (days === 1) return "bg-orange-500 text-white";
        if (days <= 3) return "bg-yellow-500 text-white";
        return "bg-blue-500 text-white";
    };

    const sendBirthdayEmail = async (member: BirthdayMember) => {
        try {
            const response = await fetch('/api/email/birthday-wish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: member.fullName,
                    email: member.email,
                    age: member.age + 1 // They will be this age on their birthday
                }),
            });

            if (response.ok) {
                toast({
                    title: "Birthday Email Sent",
                    description: `Birthday wish sent to ${member.fullName}`,
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send birthday email');
            }
        } catch (error) {
            console.error('Birthday email error:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send birthday email. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2">Loading upcoming birthdays...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardContent className="pt-6">
                    <div className="text-center text-red-600">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Error loading birthdays: {error}</p>
                        <Button variant="outline" size="sm" onClick={() => mutate()} className="mt-2">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!birthdays || birthdays.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Upcoming Birthdays (Next 7 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No upcoming birthdays in the next 7 days</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Upcoming Birthdays (Next 7 Days)
                    </div>
                    <Badge variant="secondary">{birthdays.length} members</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {birthdays.map((member: BirthdayMember) => (
                        <div key={member._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                {member.profilePhoto ? (
                                    <Image
                                        src={member.profilePhoto}
                                        alt={member.fullName}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-500" />
                                    </div>
                                )}
                                
                                <div>
                                    <h4 className="font-semibold text-gray-900">{member.fullName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Badge 
                                            variant="outline" 
                                            className={`capitalize ${
                                                member.membershipType === 'general'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                    : 'bg-green-50 text-green-700 border-green-200'
                                            }`}
                                        >
                                            {member.membershipType}
                                        </Badge>
                                        <span>•</span>
                                        <span>Turning {member.age + 1} on {formatDate(member.birthDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {member.email}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {member.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Badge className={getDaysColor(member.daysUntilBirthday)}>
                                    {getDaysText(member.daysUntilBirthday)}
                                </Badge>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendBirthdayEmail(member)}
                                    className="flex items-center gap-2"
                                >
                                    <Gift className="w-4 h-4" />
                                    Send Wish
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => mutate()} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
