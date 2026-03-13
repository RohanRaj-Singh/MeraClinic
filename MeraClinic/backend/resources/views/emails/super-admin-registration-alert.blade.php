<html>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2 style="margin-bottom: 16px;">New clinic registration pending</h2>
    <p>A new clinic registration requires review.</p>
    <p><strong>Clinic:</strong> {{ $clinic->name }}</p>
    <p><strong>Doctor:</strong> {{ $user->name }}</p>
    <p><strong>Email:</strong> {{ $user->email }}</p>
    @if ($user->phone)
        <p><strong>Phone:</strong> {{ $user->phone }}</p>
    @endif
    <p>Please review and activate this clinic from the super admin dashboard.</p>
</body>
</html>
