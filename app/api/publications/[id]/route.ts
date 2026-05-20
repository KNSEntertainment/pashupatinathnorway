import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import User from "@/models/User.Model";
import Publication from "@/models/Publication.Model";

// Connect to MongoDB
connectDB();

// GET single publication
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const publication = await Publication.findById(id);
    
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
    
    const publication = await Publication.findById(id);
    
    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
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
      language 
    } = body;
    
    // Update publication
    const updatedPublication = await Publication.findByIdAndUpdate(
      id,
      {
        title: title || publication.title,
        type: type || publication.type,
        description: description || publication.description,
        publishedDate: publishedDate || publication.publishedDate,
        downloadUrl: downloadUrl || publication.downloadUrl,
        language: language || publication.language
      },
      { new: true }
    ).populate('createdBy', 'name email');
    
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
    
    // Find user by email to get their actual ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const publication = await Publication.findById(id);
    
    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }
    
    await Publication.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: "Publication deleted successfully",
      publication: publication
    });
    
  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json(
      { error: "Failed to delete publication" },
      { status: 500 }
    );
  }
}
