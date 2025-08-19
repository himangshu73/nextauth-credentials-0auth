import dbConnect from "@/utils/dbConnect";
import UserModel from "@/model/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email, otp } = await request.json();

    const user = await UserModel.findOne({
      email,
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User Not Found",
        },
        { status: 500 }
      );
    } else {
      const isOtpCorrect = user.otp === otp;
      const isOtpExpired = user.otpExpiry && user.otpExpiry > new Date();

      if (isOtpCorrect && isOtpExpired) {
        user.isVerified = true;
        await user.save();
        return NextResponse.json(
          {
            success: true,
            message: "OTP verification successful.",
          },
          { status: 200 }
        );
      } else if (!user.otpExpiry || !isOtpExpired) {
        return NextResponse.json(
          {
            success: false,
            message: "OTP has been expired. Please sign up again.",
          },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "OTP is not correct. Please check your email.",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Error Checking OTP",
      },
      { status: 500 }
    );
  }
}
