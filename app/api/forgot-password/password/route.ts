import dbConnect from "@/utils/dbConnect";
import UserModel from "@/model/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email, token, password } = await request.json();

    const user = await UserModel.findOne({
      email,
      resetToken: token,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No user found",
        },
        { status: 500 }
      );
    }

    if (
      !user.resetToken ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or Expired Token",
        },
        { status: 500 }
      );
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Error Reseting Password",
      },
      { status: 500 }
    );
  }
}