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
      template: 'verification',
      data: {
        firstName,
        verificationUrl,
      },
    })
  },

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - DocPille',
      template: 'password-reset',
      data: {
        firstName,
        resetUrl,
      },
    })
  },
}
