import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import User from "@/models/User.Model";
import Publication from "@/models/Publication.Model";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// GET all publications
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('public') === 'true';
    const memberAccess = searchParams.get('memberAccess');
    
        
    // Build query
    const query: Record<string, unknown> = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (language && language !== 'all') {
      query.language = language;
    }
    
    // If this is a public request, only show publications with "all" access level
    if (isPublic) {
      query.accessLevels = 'all';
    }
    
    // If this is a member request, filter by member access levels
    if (memberAccess) {
      const accessLevels = memberAccess.split(',');
      query.accessLevels = { $in: accessLevels };
    }
    
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch publications from database
    const publications = await Publication.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform the data to match the expected format
    const formattedPublications = publications.map((pub) => ({
      id: (pub._id as mongoose.Types.ObjectId).toString(),
      title: pub.title,
      type: pub.type,
      description: pub.description,
      publishedDate: pub.publishedDate instanceof Date 
        ? pub.publishedDate.toISOString().split('T')[0]
        : new Date(pub.publishedDate).toISOString().split('T')[0],
      downloadUrl: pub.downloadUrl,
      language: pub.language,
      accessLevels: pub.accessLevels || [],
      createdAt: pub.createdAt,
      updatedAt: pub.updatedAt
    }));
    
    return NextResponse.json({ publications: formattedPublications });
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
    await connectDB();
    
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
      type, 
      description, 
      publishedDate, 
      downloadUrl, 
      language,
      accessLevels 
    } = body;
    
    // Validate required fields
    if (!title || !type || !description || !language) {
      return NextResponse.json(
        { error: "Missing required fields: title, type, description, language" },
        { status: 400 }
      );
    }

    // Validate language
    const validLanguages = ['en', 'ne', 'no'];
    if (!validLanguages.includes(language)) {
      return NextResponse.json(
        { error: "Invalid language. Must be one of: " + validLanguages.join(', ') },
        { status: 400 }
      );
    }

    // Validate accessLevels
    if (!accessLevels || !Array.isArray(accessLevels) || accessLevels.length === 0) {
      return NextResponse.json(
        { error: "At least one access level must be selected" },
        { status: 400 }
      );
    }

    const validAccessLevels = ['all', 'executives', 'advisors', 'active_members', 'general_members'];
    const invalidAccessLevels = accessLevels.filter(level => !validAccessLevels.includes(level));
    if (invalidAccessLevels.length > 0) {
      return NextResponse.json(
        { error: "Invalid access levels: " + invalidAccessLevels.join(', ') },
        { status: 400 }
      );
    }
    
    // Create new publication
    const newPublication = new Publication({
      title,
      type,
      description,
      publishedDate: publishedDate || new Date(),
      downloadUrl: downloadUrl || "",
      language,
      accessLevels,
      createdBy: user._id
    });
    
    await newPublication.save();
    
    // Populate createdBy field for response
    await newPublication.populate('createdBy', 'name email');
    
    // Format response to match expected format
    const formattedPublication = {
      id: newPublication._id.toString(),
      title: newPublication.title,
      type: newPublication.type,
      description: newPublication.description,
      publishedDate: newPublication.publishedDate.toISOString().split('T')[0],
      downloadUrl: newPublication.downloadUrl,
      language: newPublication.language,
      accessLevels: newPublication.accessLevels,
      createdAt: newPublication.createdAt,
      updatedAt: newPublication.updatedAt
    };
    
    return NextResponse.json({
      message: "Publication created successfully",
      publication: formattedPublication
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating publication:", error);
    return NextResponse.json(
      { error: "Failed to create publication" },
      { status: 500 }
    );
  }
}
