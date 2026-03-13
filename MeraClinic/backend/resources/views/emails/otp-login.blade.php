<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mera Clinic OTP</title>
</head>
<body style="margin:0; padding:24px; background:#f4f7f6; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
        <tr>
            <td style="padding:28px 32px; background:#0f8b74; color:#ffffff;">
                <h1 style="margin:0; font-size:24px;">Mera Clinic</h1>
                <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">Secure login verification</p>
            </td>
        </tr>
        <tr>
            <td style="padding:32px;">
                <p style="margin:0 0 16px; font-size:15px;">Hello {{ $user->name }},</p>
                <p style="margin:0 0 20px; font-size:15px; line-height:1.6;">
                    We detected a login that requires extra verification. Use the one-time password below to complete sign in.
                </p>

                <div style="margin:0 0 20px; padding:20px; text-align:center; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:14px;">
                    <div style="font-size:13px; color:#166534; margin-bottom:8px;">Your OTP code</div>
                    <div style="font-size:32px; letter-spacing:10px; font-weight:700; color:#14532d;">{{ $otp }}</div>
                </div>

                <p style="margin:0 0 12px; font-size:14px; line-height:1.6;">
                    This code will expire at <strong>{{ $expiresAt }}</strong>.
                </p>
                <p style="margin:0; font-size:14px; line-height:1.6; color:#6b7280;">
                    If you did not try to log in, change your password and review admin access immediately.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
