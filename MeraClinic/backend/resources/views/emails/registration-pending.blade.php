<html>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2 style="margin-bottom: 16px;">Registration received</h2>
    <p>Hello {{ $user->name }},</p>
    <p>Your clinic <strong>{{ $clinic->name }}</strong> has been registered on Mera Clinic and is now waiting for super admin approval.</p>
    <p>We will email you again as soon as your clinic is approved and ready for login.</p>
    <p style="margin-top: 24px;">Regards,<br>Mera Clinic</p>
</body>
</html>
