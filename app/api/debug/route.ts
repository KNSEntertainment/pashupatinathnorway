import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Membership from '@/models/Membership.Model';

export async function GET() {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get all members to debug
    const allMembers = await Membership.find({}).select('_id firstName lastName email membershipStatus');
    
    // Get your specific member
    const yourMember = await Membership.findOne({ email: 'yes.harisanjel@gmail.com' });
    
    return NextResponse.json({
      totalMembers: allMembers.length,
      yourMember: {
        _id: yourMember?._id,
        membershipNumber: yourMember?._id?.toString().slice(-6).toUpperCase(),
        personalNumber: yourMember?.personalNumber,
        name: `${yourMember?.firstName} ${yourMember?.lastName}`,
        email: yourMember?.email,
        status: yourMember?.membershipStatus
      },
      sampleMembers: allMembers.slice(0, 3).map(m => ({
        _id: m._id,
        membershipNumber: m._id.toString().slice(-6).toUpperCase(),
        personalNumber: m.personalNumber,
        name: `${m.firstName} ${m.lastName}`,
        email: m.email
      }))
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        error: 'Debug error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
