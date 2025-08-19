import dbConnect from "@/utils/dbConnect";
import UserModel from "@/model/user";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email } = await request.json();

    const user = await UserModel.findOne({
      email,
    }).select("+password");
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User Not Found",
        },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password not found",
        },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);
    user.resetToken = token;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    const resetLink = `${process.env.NEXTAUTH_URL}/forgot-password/password?token=${token}&email=${email}`;

    if (user) {
      try {
        await resend.emails.send({
          from: "Himangshu XYZ <noreply@himangshu.xyz>",
          to: email,
          subject: "Reset your password",
          html: `<p>Click to reset password: <a href="${resetLink}">Reset Link</a></p>`,
        });
        return NextResponse.json(
          { success: true, message: "Reset Link sent" },
          { status: 200 }
        );
      } catch (error) {
        console.error("Resend email error:", error);
        throw error;
      }
    }
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