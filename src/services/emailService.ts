import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs/promises'
import config from '../config/config'
import { logger } from '../utils/logger'

const createTransporter = async () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  })
}

const loadTemplate = async (templateName: string): Promise<string> => {
  const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`)
  return fs.readFile(templatePath, 'utf-8')
}

const compileTemplate = async (
  template: string,
  variables: Record<string, string>
): Promise<string> => {
  let compiledTemplate = template
  for (const [key, value] of Object.entries(variables)) {
    compiledTemplate = compiledTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return compiledTemplate
}

export const emailService = {
  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string
  ): Promise<void> {
    try {
      const template = await loadTemplate('verification')
      const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`

      const compiledHtml = await compileTemplate(template, {
        firstName,
        verificationUrl,
      })

      const mailOptions = {
        from: 'hello@demomailtrap.co', // or config.email.fromEmail
        to: email,
        subject: 'Verify Your Email - DocPille',
        html: compiledHtml,
      }

      const transport = await createTransporter()
      await transport.sendMail(mailOptions)

      logger.info('Verification email sent successfully', { email })
    } catch (error) {
      logger.error('Failed to send verification email', { email, error })
    }
  },
}
