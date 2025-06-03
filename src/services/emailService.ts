import nodemailer from 'nodemailer'
import { renderFile } from 'ejs'
import path from 'path'

// local imports
import config from '../config/config'
import { logger } from '../utils/logger'

interface EmailData {
  to: string
  subject: string
  template: string
  data: Record<string, unknown>
}

const transporter =
  config.nodeEnv === 'dev'
    ? nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'jordyn.fay69@ethereal.email',
          pass: 'vRBc1SczUNbTbTVBaa',
        },
      })
    : nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      })

async function sendEmail({ to, subject, template, data }: EmailData): Promise<void> {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', `${template}.ejs`)
    const html = await renderFile(templatePath, data)

    const info = await transporter.sendMail({
      from: config.email.fromEmail,
      to,
      subject,
      html,
    })

    logger.info('Email sent successfully', { to, template })
    if (config.nodeEnv === 'dev') {
      logger.info(`Ethereal email preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    }
  } catch (error) {
    logger.error('Failed to send email', { to, template, error })
    // TODO: Inform admin, add retry logic
  }
}

export const emailService = {
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - DocPille',
      template: 'unified-action',
      data: {
        title: 'Welcome to DocPille!',
        greeting: firstName,
        message:
          'Please click the button below to verify your email address and activate your account.',
        buttonText: 'Verify Email',
        buttonUrl: verificationUrl,
        expiryText: 'This link will expire in 24 hours.',
      },
    })
  },

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - DocPille',
      template: 'unified-action',
      data: {
        title: 'Reset Your Password - DocPille',
        greeting: firstName,
        message:
          'We received a request to reset your password. Please click the button below to create a new password.',
        buttonText: 'Reset Password',
        buttonUrl: resetUrl,
        expiryText: 'This link will expire in 1 hour.',
      },
    })
  },

  async sendDoctorInviteEmail(email: string, token: string, firstName: string): Promise<void> {
    const inviteUrl = `${config.frontendUrl}/reset-password?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Join DocPille as a Doctor!',
      template: 'unified-action',
      data: {
        title: 'You are invited to join DocPille as a Doctor',
        greeting: firstName,
        message:
          'You have been invited to join DocPille as a doctor. Please click the button below to set your password and complete your registration.',
        buttonText: 'Set Your Password',
        buttonUrl: inviteUrl,
        expiryText: 'This link will expire in 24 hours.',
      },
    })
  },
}
