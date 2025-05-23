import { Request } from 'express'
import './types/express'


const test = (req: Request) => {
  if (req.user) {
    console.log(req.user.id)
  } else {
    console.log('user not found on request')
  }
}
