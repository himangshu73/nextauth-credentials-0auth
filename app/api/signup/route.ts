import dbConnect from "@/utils/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    const existingUser = await UserModel.findOne({
      email,
    });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "Email is already registered and verified",
          },
          { status: 500 }
        );
      } else {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setHours(otpExpiry.getHours() + 1);

        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();
        try {
          await resend.emails.send({
            from: "Himangshu XYZ <otp@himangshu.xyz>",
            to: email,
            subject: `Welcome Back`,
            html: `<p>Your OTP is ${otp}. OTP will be expired in ${otpExpiry}</p>`,
          });
        } catch (error) {
          console.error("Resend email error:", error);
          throw error;
        }
        return NextResponse.json({
          success: true,
          message: "Email already registered. OTP sent to mail.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getHours() + 1);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    await newUser.save();
    try {
      await resend.emails.send({
        from: "Himangshu XYZ <otp@himangshu.xyz>",
        to: email,
        subject: `Welcome`,
        html: `<p>Your OTP is ${otp}. OTP will be expired in ${otpExpiry}</p>`,
      });
    } catch (error) {
      console.error("Resend email error:", error);
      throw error;
    }
    return NextResponse.json(
      {
        success: true,
        message: "Signup Successfull. Please verify your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error Registering New User", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error registering new user",
      },
      { status: 500 }
    );
  }
}
