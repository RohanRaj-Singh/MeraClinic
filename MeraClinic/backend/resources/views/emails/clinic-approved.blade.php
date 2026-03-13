<html>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2 style="margin-bottom: 16px;">Your clinic is approved</h2>
    <p>Hello {{ $user->name }},</p>
    <p>Your clinic <strong>{{ $clinic->name }}</strong> has been approved by the Mera Clinic super admin team.</p>
    <p>You can now sign in using your registered email and password.</p>
    <p style="margin: 24px 0;">
        <a href="{{ $loginUrl }}" style="display: inline-block; background: #166534; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px;">Login to Mera Clinic</a>
    </p>
    <p>If the button does not work, open this link:</p>
    <p><a href="{{ $loginUrl }}">{{ $loginUrl }}</a></p>
    <p style="margin-top: 24px;">Regards,<br>Mera Clinic</p>
</body>
</html>
