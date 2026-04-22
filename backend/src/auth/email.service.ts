import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey && apiKey !== 'your-sendgrid-api-key') {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const fromEmail = this.configService.get<string>('FROM_EMAIL', 'noreply@ideahub.com');

    const msg = {
      to: email,
      from: fromEmail,
      subject: 'Verify Your IdeaHub Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to IdeaHub, ${name}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // In development, log the verification URL
      if (process.env.NODE_ENV === 'development') {
        console.log('Verification URL:', verificationUrl);
      }
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const fromEmail = this.configService.get<string>('FROM_EMAIL', 'noreply@ideahub.com');

    const msg = {
      to: email,
      from: fromEmail,
      subject: 'Reset Your IdeaHub Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // In development, log the reset URL
      if (process.env.NODE_ENV === 'development') {
        console.log('Password Reset URL:', resetUrl);
      }
    }
  }

  async sendNotificationEmail(email: string, subject: string, content: string) {
    const fromEmail = this.configService.get<string>('FROM_EMAIL', 'noreply@ideahub.com');

    const msg = {
      to: email,
      from: fromEmail,
      subject,
      html: content,
    };

    try {
      await sgMail.send(msg);
      console.log(`Notification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }
}
