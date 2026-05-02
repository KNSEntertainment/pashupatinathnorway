import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // weekly, monthly, yearly

    console.log(`=== DONATION ANALYTICS API CALLED - Period: ${period} ===`);

    // Get completed donations only
    const completedDonations = await Donation.find({ 
      paymentStatus: "completed" 
    }).sort({ createdAt: 1 });

    console.log(`Found ${completedDonations.length} completed donations`);

    let aggregatedData: Array<{
      date: string;
      amount: number;
      label: string;
    }> = [];

    if (period === 'weekly') {
      // Group by week
      const weeklyData = new Map<string, number>();
      
      completedDonations.forEach(donation => {
        const date = new Date(donation.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const currentAmount = weeklyData.get(weekKey) || 0;
        weeklyData.set(weekKey, currentAmount + donation.amount);
      });

      // Convert to array and sort by date
      aggregatedData = Array.from(weeklyData.entries())
        .map(([date, amount]) => ({
          date,
          amount,
          label: `Week of ${new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}`
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    } else if (period === 'monthly') {
      // Group by month
      const monthlyData = new Map<string, number>();
      
      completedDonations.forEach(donation => {
        const date = new Date(donation.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const currentAmount = monthlyData.get(monthKey) || 0;
        monthlyData.set(monthKey, currentAmount + donation.amount);
      });

      // Convert to array and sort by date
      aggregatedData = Array.from(monthlyData.entries())
        .map(([date, amount]) => ({
          date,
          amount,
          label: new Date(date + '-01').toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric'
          })
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    } else if (period === 'yearly') {
      // Group by year
      const yearlyData = new Map<string, number>();
      
      completedDonations.forEach(donation => {
        const date = new Date(donation.createdAt);
        const yearKey = date.getFullYear().toString();
        
        const currentAmount = yearlyData.get(yearKey) || 0;
        yearlyData.set(yearKey, currentAmount + donation.amount);
      });

      // Convert to array and sort by date
      aggregatedData = Array.from(yearlyData.entries())
        .map(([date, amount]) => ({
          date,
          amount,
          label: `${date}`
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    console.log(`Generated ${aggregatedData.length} data points for ${period} view`);

    return NextResponse.json({
      success: true,
      data: aggregatedData,
      period,
      totalDonations: completedDonations.length,
      totalAmount: completedDonations.reduce((sum, d) => sum + d.amount, 0)
    });

  } catch (error) {
    console.error("Error fetching donation analytics:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch donation analytics", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
