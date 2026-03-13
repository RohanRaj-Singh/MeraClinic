<?php

namespace App\Mail;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewClinicRegistrationAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Clinic $clinic
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New clinic registration needs approval'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.super-admin-registration-alert'
        );
    }
}
