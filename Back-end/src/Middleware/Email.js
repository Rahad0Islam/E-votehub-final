import { transporter } from "./Email.config.js";



export const SendVerificationCode=async(Email,verificarionCode)=>{
    try {
         const info = await transporter.sendMail({
              from: '"E-voteHub" <vairahad99@gmail.com>',
              to: Email,
              subject: "EvoteHub ✔",
              text: "Verify your Email ", // plain‑text body
              html:verificarionCode, // HTML body
            });

            console.log("Email send succesfully");
    } catch (error) {
        console.log("Sending email error ",error);
    }
}