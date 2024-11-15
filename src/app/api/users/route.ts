import { User } from "@/models/userModel";
import { connectToDatabase } from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    // const users = await User.find({}, "name email isOnline");
    const users = await User.find({});
    console.log("API: Fetched users:", users); // Add this log
    return NextResponse.json(users);
  } catch (error) {
    console.error("API: Error fetching users:", error); // Add this log
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
