<?php

namespace App\Mail;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationPendingMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Clinic $clinic
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Mera Clinic registration is pending approval'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-pending'
        );
    }
}
