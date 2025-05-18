import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs/promises'
import config from '../config/config'

// Create reusable transporter based on environment
const createTransporter = async () => {
  if (config.nodeEnv === 'dev') {
    try {
      const testAccount = await nodemailer.createTestAccount()
      console.log('\n📧 Using Ethereal test account for email previews')
      const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })

      // Enhance the transport with preview URL capability
      // TODO: revisit this when creating tests
      const originalSendMail = transport.sendMail.bind(transport)
      transport.sendMail = async mailOptions => {
        const info = await originalSendMail(mailOptions)
        const previewUrl = nodemailer.getTestMessageUrl(info)
        if (previewUrl) console.log('\n📧 Email Preview URL:', previewUrl)
        return info
      }

      return transport
    } catch (error) {
      console.warn('\n⚠️  Failed to create Ethereal test account, falling back to console logging')
      return {
        sendMail: async (mailOptions: any) => {
          const divider = '='.repeat(50)
          console.log('\n' + divider)
          console.log('📧 EMAIL PREVIEW (Development Mode)')
          console.log(divider)
          console.log('From:    ', mailOptions.from)
          console.log('To:      ', mailOptions.to)
          console.log('Subject: ', mailOptions.subject)
          console.log(divider)
          console.log('Content:')
          console.log(mailOptions.text || mailOptions.html)
          console.log(divider + '\n')

          return { messageId: 'mock-id', preview: true }
        },
      }
    }
  }

  // For production, use configured SMTP server
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  })
}

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
      const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`

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

      const transport = await createTransporter()
      await transport.sendMail(mailOptions)
    } catch (error) {
      console.error('\n❌ Error sending verification email:', error)
      throw new Error('Failed to send verification email')
    }
  }
}
