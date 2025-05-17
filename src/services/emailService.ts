import nodemailer from 'nodemailer'
import rateLimit from 'express-rate-limit'
import path from 'path'
import fs from 'fs/promises'
import config from '../config/config'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
})

// Rate limiter for email sending - 3 attempts per IP per hour
export const emailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many email verification attempts. Please try again in an hour.',
})

export class EmailService {
  private static async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`)
    return fs.readFile(templatePath, 'utf-8')
  }

  private static async compileTemplate(
    template: string,
    variables: Record<string, string>
  ): Promise<string> {
    let compiledTemplate = template
    for (const [key, value] of Object.entries(variables)) {
      compiledTemplate = compiledTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return compiledTemplate
  }

  static async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<void> {
    try {
      const template = await this.loadTemplate('verification')
      const verificationUrl = `http://localhost:3000/api/patients/verify-email?token=${token}`

      const compiledHtml = await this.compileTemplate(template, {
        firstName,
        verificationUrl,
      })

      const mailOptions = {
        from: config.email.fromEmail,
        to: email,
        subject: 'Verify Your Email - DocPille',
        html: compiledHtml,
      }

      if (config.nodeEnv === 'dev') {
        const testAccount = await nodemailer.createTestAccount()
        const testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
        const info = await testTransporter.sendMail(mailOptions)
        console.log('Email Preview URL:', nodemailer.getTestMessageUrl(info))
      } else {
        await transporter.sendMail(mailOptions)
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
      throw new Error('Failed to send verification email')
    }
  }
}
