import { User } from "../Models/User.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { AsynHandler } from "../Utils/AsyncHandler.js";
import { FileDelete, FileUpload } from "../Utils/Cloudinary.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs'
import { transporter } from "../Middleware/Email.config.js";

const Option={
    httpOnly:true,
    secure:true
}

// In-memory store for pending registrations (email OTP)
const pendingRegs = new Map(); // token => { code, expiresAt, data }

const generateOtp = ()=> String(Math.floor(100000 + Math.random()*900000));
const genToken = ()=> crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');

// Professional email template
function buildEmailTemplate({ title, subtitle, body, footerNote }){
  const primary = '#1E3A8A';
  const link = '#3B82F6';
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f4f5f7;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.06);overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:18px 24px;background:${primary};color:#ffffff;">
                <div style="font-size:20px;font-weight:800;letter-spacing:0.3px;">E‑VoteHub</div>
                <div style="font-size:12px;opacity:0.9;">Trusted E‑Voting Platform</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px 24px;">
                <h1 style="margin:0;font-size:22px;line-height:28px;color:#111827;">${title}</h1>
                ${subtitle ? `<p style="margin:8px 0 0 0;font-size:14px;color:#4b5563;">${subtitle}</p>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 28px 24px;">${body}</td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                ${footerNote || 'If you did not request this, you can safely ignore this email.'}
                <div style="margin-top:6px;">© ${new Date().getFullYear()} E‑VoteHub</div>
              </td>
            </tr>
          </table>
          <div style="font-size:11px;color:#9ca3af;margin-top:12px;">This is an automated message, please do not reply.</div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

// Helper to send email
async function sendMail({ to, subject, html }){
  if(!to) return;
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
}


const GenerateAccessAndRefreshToken=async function (UserID) {

  try {
      const user=await User.findById(UserID);
      if(!user)throw new ApiError(501,"user not found ! ")

      const AccessToken=  user.GenerateAccessToken();
      const RefreshToken=user.GenerateRefreshToken();
  
      user.RefreshToken=RefreshToken;
      await user.save({validateBeforeSave:false})
      return {AccessToken,RefreshToken}
  } catch (error) {
      throw new ApiError(501,"cannot generate access and refresstoken ")
  }
}


// Step 1: Initialize registration, send OTP, hold data in memory
const Register = AsynHandler(async(req,res)=>{
    const {FullName="",UserName="",Email="",DateOfBirth="",Gender="",Password="",NID="",PhoneNumber=""}=req.body;
    if(FullName==="" || UserName==="" || Email==="" || DateOfBirth===""|| Gender==="" || Password==="" || NID===""){
      throw new ApiError(401,"All feilds are required")
    }

    // pre-check duplicates
    const AlreadyExistEmailUsername= await User.findOne({ $or:[{Email},{UserName}] })
    if(AlreadyExistEmailUsername) throw new ApiError(401,"Username or Email already Exist");

    let ProfileImageLocalPath="";
    let CoverImageLocalPath="";

    if (
      Array.isArray(req.files?.ProfileImage) && req.files?.ProfileImage.length > 0 &&
      Array.isArray(req.files?.CoverImage) && req.files?.CoverImage.length > 0
    ){
      ProfileImageLocalPath=req.files?.ProfileImage[0]?.path;
      CoverImageLocalPath= req.files?.CoverImage[0]?.path;
    }

    if(!ProfileImageLocalPath){ throw new ApiError(401,"profile picture is required"); }
    if(!CoverImageLocalPath){ throw new ApiError(401,"Cover image is required"); }

    // Generate OTP and token
    const code = generateOtp();
    const token = genToken();
    const expiresAt = Date.now() + 10*60*1000; // 10 minutes

    // Store pending data (do not upload or create user yet)
    pendingRegs.set(token, {
      code,
      expiresAt,
      data: { FullName,UserName,Email,DateOfBirth,Gender,Password,NID,PhoneNumber, ProfileImageLocalPath, CoverImageLocalPath }
    });

    // Send OTP email (professional style)
    const html = buildEmailTemplate({
      title: 'Verify your email address',
      subtitle: 'Use the code below to complete your E‑VoteHub registration. This code expires in 10 minutes.',
      body: `
        <div style="margin-top:8px">
          <div style="font-size:13px;color:#374151;margin-bottom:10px">Your one‑time verification code:</div>
          <div style="font-size:28px;line-height:38px;font-weight:900;letter-spacing:6px;padding:12px 16px;border:1px dashed #d1d5db;border-radius:10px;background:#f9fafb;color:#111827;text-align:center;">
            ${code}
          </div>
          <div style="font-size:12px;color:#6b7280;margin-top:12px">If you didn’t initiate this request, please ignore this email.</div>
        </div>`,
      footerNote: 'Need help? Contact support at <a href="mailto:support@evotehub.example" style="color:#3B82F6;text-decoration:none;">support@evotehub.example</a>.'
    });

    await sendMail({ to: Email, subject: 'Your E‑VoteHub verification code', html })

    return res.status(200).json(new ApiResponse(200, { otpToken: token }, "OTP sent to email"))
})

// Step 2: Verify OTP and complete registration
const RegisterVerify = AsynHandler(async (req, res) => {
  const { otpToken, code } = req.body || {};
  if(!otpToken || !code) throw new ApiError(400, 'otpToken and code are required');
  const pending = pendingRegs.get(otpToken);
  if(!pending) throw new ApiError(400, 'Invalid or expired token');
  if(Date.now() > pending.expiresAt) { pendingRegs.delete(otpToken); throw new ApiError(400, 'OTP expired'); }
  if(String(code).trim() !== String(pending.code)) throw new ApiError(400, 'Invalid code');

  const { FullName,UserName,Email,DateOfBirth,Gender,Password,NID,PhoneNumber, ProfileImageLocalPath, CoverImageLocalPath } = pending.data;

  // Upload to Cloudinary
  const ProfileImage = await FileUpload(ProfileImageLocalPath);
  const CoverImage = await FileUpload(CoverImageLocalPath);
  if(!ProfileImage || !CoverImage) throw new ApiError(501,'Cloudinary problem')

  // Create user
  const user=await User.create({
    FullName,UserName,Email,DateOfBirth,Gender,Password,NID,PhoneNumber,
    ProfileImage:ProfileImage?.url,
    CoverImage:CoverImage?.url,
    ProfilePublicId:ProfileImage?.public_id,
    CoverPublicId:CoverImage?.public_id
  })

  const CreateUser=await User.findById(user._id).select("-Password -RefreshToken");
  if(!CreateUser) throw new ApiError(501,'Something Went Wrong while registering!')

  // Clean up pending and temp files
  pendingRegs.delete(otpToken);
  try{ if(ProfileImageLocalPath) fs.unlink(ProfileImageLocalPath, ()=>{}) }catch{}
  try{ if(CoverImageLocalPath) fs.unlink(CoverImageLocalPath, ()=>{}) }catch{}

  // Send welcome email (professional style)
  const welcomeHtml = buildEmailTemplate({
    title: `Welcome, ${FullName}!`,
    subtitle: 'Your E‑VoteHub account has been created successfully.',
    body: `<div style="font-size:14px;color:#374151;line-height:22px;">
      <p>We’re excited to have you on board. You can now log in and participate in secure digital elections.</p>
      <ul style="margin:10px 0 0 18px;color:#374151;">
        <li>Keep your credentials safe.</li>
        <li>Complete your profile and explore ongoing events.</li>
        <li>Need assistance? We’re here to help.</li>
      </ul>
    </div>`,
    footerNote: 'Thank you for choosing E‑VoteHub.'
  });

  await sendMail({ to: Email, subject: 'Welcome to E‑VoteHub', html: welcomeHtml })

  return res.status(201).json(new ApiResponse(201, CreateUser, 'Registered successfully'))
})


const LogIn=AsynHandler(async(req,res)=>{

    
    const {UserName,Email,Password}=req.body;

    if ((!UserName?.trim() && !Email?.trim()) || !Password?.trim()) {
    throw new ApiError(401, "Username or Email and Password are required!");
    }

    const user=await User.findOne({
        $or:[{Email},{UserName}]
    })

    if(!user)throw new ApiError(401,"user not found!");

    const IsPassCorr=await user.IsPasswordCorrect(Password)
    if(!IsPassCorr)throw new ApiError(401,"Password is not correct ");

    const {AccessToken,RefreshToken}=await GenerateAccessAndRefreshToken(user._id)
    console.log("AccessToken : ",AccessToken);
    
    const LogInUser=await User.findById(user._id).select("-Password -RefreshToken")
    if(!LogInUser)throw new ApiError(501,"User not found")

    console.log("Log in succesfully! ");
    return res
    .status(201)
    .cookie("AccessToken",AccessToken,Option)
    .cookie("RefreshToken",RefreshToken,Option)
    .json(
        new ApiResponse(201,{AccessToken,RefreshToken,LogInUser},"log in successfully ")
    )

})

const LogOut=AsynHandler(async(req,res)=>{

   const L_user= await User.findByIdAndUpdate(req.user._id,{
        $unset:{RefreshToken:""}
    },
    {
         new:true   //RETURN USER DB AFTER UPDATE
    }

    )
        
    
    console.log("Log out SuccesFully!");
    return res
    .status(201)
    .clearCookie('AccessToken',Option)
    .clearCookie('RefreshToken',Option)
    .json(
        new ApiResponse(201,L_user,"Logout Succesfully!")
    )
})

const RenewAccesToken=AsynHandler(async(req,res)=>{
      const IncomingRefreshToken=req.cookies?.RefreshToken || req.body?.RefreshToken
       || (await User.findById(req.user?._id).select("RefreshToken"))?.RefreshToken;
    

        if(!IncomingRefreshToken)throw new ApiError(401,"Refresh token invalid !")


        try {
    
          const Decode_User_id=jwt.verify(IncomingRefreshToken,process.env.REFRESS_TOKEN_SECRET);
    
          const user=await User.findById(Decode_User_id?._id);
          if(!user)throw new ApiError(401,"invalid refresh token")
    
    
          if(IncomingRefreshToken!==user?.RefreshToken)throw new ApiError(401,"Refresh token expired ")
    
          const{AccessToken,RefreshToken} = await GenerateAccessAndRefreshToken(user?._id);
          console.log("renew the access token ");
        
          return res
          .status(201)
          .cookie("AccessToken",AccessToken,Option)
          .cookie("RefreshToken",RefreshToken,Option)
          .json(
            new ApiResponse(201,{AccessToken,RefreshToken},"Renew the accesstoken !")
          )

    } catch (error) {
        throw new ApiError(401,"invalid refresh token(catch)")
    }

})


const ChangePassword=AsynHandler(async(req,res)=>{
    const {NewPassword,OldPassword}=req.body
    //check password is correct or wrong

    const user=await User.findById(req.user?._id);
    if(!user)throw new ApiError(401,"User not found ! ");

    const IsPassCorr=await user.IsPasswordCorrect(OldPassword);
    if(!IsPassCorr)throw new ApiError(401,"Current Password is incorrect! ");

    user.Password=NewPassword;
    const SavePass=await user.save({validateBeforeSave:false});   
    console.log("Password changed successfully");

    return res
    .status(201)
    .json(
        new ApiResponse(201,{"savePass":SavePass},"Password changed successfully! ")
    )

})

const UpdateProfilePic=AsynHandler(async(req,res)=>{
      const ProfileImageLocalPath=req.file?.path;

      if(!ProfileImageLocalPath)throw new ApiError(401,"profile picture required");

     const DelOldProfile= await FileDelete(req.user?.ProfilePublicId);

     if(!DelOldProfile)throw new ApiError(501,"Can not deleted Old Profile Picture");

      console.log("deleted Old Profile Picture");

     const NewProfilePic= await FileUpload(ProfileImageLocalPath);

     if(!NewProfilePic)throw new ApiError(501,"can not upload profile picture in cloudinary ")
     console.log("New Profile picture uploaded Succesfully ");

     const user=await User.findByIdAndUpdate(req.user?._id,
         {  
            $set:{
                ProfileImage:NewProfilePic.url,
                ProfilePublicId:NewProfilePic.public_id
                }
        },{
            new:true
        }
     ).select("-Password -RefreshToken");

     return res
     .status(201)
     .json(
        new ApiResponse(201,user,"profile pic updated succesfully! ")
     )
})


const UpdateCoverPic=AsynHandler(async(req,res)=>{
      const CoverImageLocalPath=req.file?.path;

      if(!CoverImageLocalPath)throw new ApiError(401,"Cover picture required");

     const DelOldCover= await FileDelete(req.user?.CoverPublicId);

     if(!DelOldCover)throw new ApiError(501,"Can not deleted Old Cover Picture");

      console.log("deleted Old Cover Picture");

     const NewCoverPic= await FileUpload(CoverImageLocalPath);

     if(!NewCoverPic)throw new ApiError(501,"can not upload Cover picture in cloudinary ")
     console.log("New Cover picture uploaded Succesfully ");

     const user=await User.findByIdAndUpdate(req.user?._id,
         {  
            $set:{
                 CoverImage:NewCoverPic.url,
                 CoverPublicId:NewCoverPic.public_id
                }
        },{
            new:true
        }
     ).select("-Password -RefreshToken");

     return res
     .status(201)
     .json(
        new ApiResponse(201,user,"Cover pic updated succesfully! ")
     )
})

// Public profile fetch by ID (omits sensitive fields)
const GetUserPublicProfile = AsynHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-Password -RefreshToken");
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
})

export {
    Register,
    LogIn,
    LogOut,
    RenewAccesToken,
    ChangePassword,
    UpdateProfilePic,
    UpdateCoverPic,
    GetUserPublicProfile,
    RegisterVerify
}