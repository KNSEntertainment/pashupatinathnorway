import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BoardMember from "@/models/BoardMember.Model";

// GET all board members
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    let query = {};
    if (type) {
      query.type = { $in: type.split(',') };
    }
    
    const members = await BoardMember.find(query).sort({ type: 1, name: 1 });
    
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching board members:", error);
    return NextResponse.json(
      { error: "Failed to fetch board members" },
      { status: 500 }
    );
  }
}

// POST new board member
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, position, type, membershipId, email, phone } = body;
    
    if (!name || !position || !type) {
      return NextResponse.json(
        { error: "Name, position, and type are required" },
        { status: 400 }
      );
    }
    
    // Check if member with same name and position already exists
    const existingMember = await BoardMember.findOne({ 
      name: name.trim(), 
      position: position.trim() 
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: "A member with this name and position already exists" },
        { status: 400 }
      );
    }
    
    const newMember = new BoardMember({
      name: name.trim(),
      position: position.trim(),
      type,
      membershipId: membershipId?.trim() || undefined,
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined
    });
    
    await newMember.save();
    
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error creating board member:", error);
    return NextResponse.json(
      { error: "Failed to create board member" },
      { status: 500 }
    );
  }
}

// PUT update board member
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { _id, name, position, type, membershipId, email, phone } = body;
    
    if (!_id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }
    
    if (!name || !position || !type) {
      return NextResponse.json(
        { error: "Name, position, and type are required" },
        { status: 400 }
      );
    }
    
    const updatedMember = await BoardMember.findByIdAndUpdate(
      _id,
      {
        name: name.trim(),
        position: position.trim(),
        type,
        membershipId: membershipId?.trim() || undefined,
        email: email?.trim() || undefined,
        phone: phone?.trim() || undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedMember) {
      return NextResponse.json(
        { error: "Board member not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating board member:", error);
    return NextResponse.json(
      { error: "Failed to update board member" },
      { status: 500 }
    );
  }
}

// DELETE board member
export async function DELETE(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { _id } = body;
    
    if (!_id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }
    
    const deletedMember = await BoardMember.findByIdAndDelete(_id);
    
    if (!deletedMember) {
      return NextResponse.json(
        { error: "Board member not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Board member deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting board member:", error);
    return NextResponse.json(
      { error: "Failed to delete board member" },
      { status: 500 }
    );
  }
}
