import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import User from "@/models/User.Model";

// Temporary in-memory storage until we create the Publication model
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

// GET all publications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const language = searchParams.get('language');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    
    let filteredPublications = [...publications];
    
    // Apply filters
    if (type && type !== 'all') {
      filteredPublications = filteredPublications.filter(pub => pub.type === type);
    }
    
    if (language && language !== 'all') {
      filteredPublications = filteredPublications.filter(pub => pub.language === language);
    }
    
    if (year && year !== 'all') {
      filteredPublications = filteredPublications.filter(pub => pub.year.toString() === year);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPublications = filteredPublications.filter(pub => 
        pub.title.toLowerCase().includes(searchLower) ||
        pub.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by most recent first
    filteredPublications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ publications: filteredPublications });
  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      { error: "Failed to fetch publications" },
      { status: 500 }
    );
  }
}

// POST - Create new publication
export async function POST(request: NextRequest) {
  try {
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
    
    // Validate required fields
    if (!title || !year || !type || !description || !language) {
      return NextResponse.json(
        { error: "Missing required fields: title, year, type, description, language" },
        { status: 400 }
      );
    }
    
    // Create new publication
    const newPublication = {
      id: Date.now().toString(),
      title,
      year: parseInt(year),
      type,
      description,
      fileSize: fileSize || "Unknown",
      pages: pages || 0,
      publishedDate: publishedDate || new Date().toISOString().split('T')[0],
      downloadUrl: downloadUrl || "",
      previewUrl: previewUrl || "",
      language,
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    publications.push(newPublication);
    
    return NextResponse.json({
      message: "Publication created successfully",
      publication: newPublication
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating publication:", error);
    return NextResponse.json(
      { error: "Failed to create publication" },
      { status: 500 }
    );
  }
}
