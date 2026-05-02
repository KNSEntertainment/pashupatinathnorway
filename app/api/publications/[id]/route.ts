import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import User from "@/models/User.Model";

// Temporary in-memory storage (same as main route)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const publications: any[] = [
  {
    id: "1",
    title: "Annual Financial Report 2024",
    year: 2024,
    type: "financial",
    description: "Comprehensive financial statement including income, expenses, and balance sheet for the fiscal year 2024.",
    fileSize: "2.4 MB",
    pages: 45,
    publishedDate: "2024-03-15",
    downloadUrl: "/reports/financial-2024.pdf",
    previewUrl: "/reports/financial-2024-preview.pdf",
    language: "en",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15")
  },
  {
    id: "2",
    title: "Annual Activity Summary 2024",
    year: 2024,
    type: "activity",
    description: "Complete overview of all temple activities, festivals, and community events conducted in 2024.",
    fileSize: "5.1 MB",
    pages: 78,
    publishedDate: "2024-04-20",
    downloadUrl: "/reports/activity-2024.pdf",
    previewUrl: "/reports/activity-2024-preview.pdf",
    language: "en",
    createdAt: new Date("2024-04-20"),
    updatedAt: new Date("2024-04-20")
  },
  {
    id: "3",
    title: "Membership Statistics 2024",
    year: 2024,
    type: "membership",
    description: "Detailed membership growth analysis, demographic breakdown, and engagement metrics for 2024.",
    fileSize: "1.8 MB",
    pages: 32,
    publishedDate: "2024-02-10",
    downloadUrl: "/reports/membership-2024.pdf",
    previewUrl: "/reports/membership-2024-preview.pdf",
    language: "en",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10")
  }
];

// GET single publication
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const publication = publications.find(pub => pub.id === id);
    
    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ publication });
  } catch (error) {
    console.error("Error fetching publication:", error);
    return NextResponse.json(
      { error: "Failed to fetch publication" },
      { status: 500 }
    );
  }
}

// PUT - Update publication
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }
    
    // Find user by email to get their actual ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const publicationIndex = publications.findIndex(pub => pub.id === id);
    
    if (publicationIndex === -1) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { 
      title, 
      year, 
      type, 
      description, 
      fileSize, 
      pages, 
      publishedDate, 
      downloadUrl, 
      previewUrl, 
      language 
    } = body;
    
    // Update publication
    const updatedPublication = {
      ...publications[publicationIndex],
      title: title || publications[publicationIndex].title,
      year: year ? parseInt(year) : publications[publicationIndex].year,
      type: type || publications[publicationIndex].type,
      description: description || publications[publicationIndex].description,
      fileSize: fileSize || publications[publicationIndex].fileSize,
      pages: pages !== undefined ? pages : publications[publicationIndex].pages,
      publishedDate: publishedDate || publications[publicationIndex].publishedDate,
      downloadUrl: downloadUrl || publications[publicationIndex].downloadUrl,
      previewUrl: previewUrl || publications[publicationIndex].previewUrl,
      language: language || publications[publicationIndex].language,
      updatedAt: new Date()
    };
    
    publications[publicationIndex] = updatedPublication;
    
    return NextResponse.json({
      message: "Publication updated successfully",
      publication: updatedPublication
    });
    
  } catch (error) {
    console.error("Error updating publication:", error);
    return NextResponse.json(
      { error: "Failed to update publication" },
      { status: 500 }
    );
  }
}

// DELETE - Delete publication
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }
    
    const publicationIndex = publications.findIndex(pub => pub.id === id);
    
    if (publicationIndex === -1) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }
    
    const deletedPublication = publications[publicationIndex];
    publications.splice(publicationIndex, 1);
    
    return NextResponse.json({
      message: "Publication deleted successfully",
      publication: deletedPublication
    });
    
  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json(
      { error: "Failed to delete publication" },
      { status: 500 }
    );
  }
}
