import prisma from '../db/db.config.js';
import { loginSchema, registerSchema } from '../validations/authValidations.js';
import vine, { errors } from '@vinejs/vine';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../config/nodemailer.js';
import logger from '../config/logger.js';
import { messages } from '@vinejs/vine/defaults';
import { emailQueue, emailQueueName } from '../jobs/EmailJob.js';

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;

      // using Validator for vinejs validation
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // Checking if Email exists
      const existingUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (existingUser) {
        return res.status(400).json({
          errors: {
            email: 'Email already exists',
          },
        });
      }

      // Encrypting Password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      //Saving user to database
      const user = await prisma.users.create({
        data: payload,
      });

      return res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages)
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: 'Something went wromg, please try again',
        });
      }
    }
  }

  static async login(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // Find the user with existing email
      const findUser = await prisma.users.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (findUser) {
        if (!bcrypt.compareSync(payload.password, findUser.password)) {
          return res.status(400).json({
            errors: {
              email: 'Invalid Credentials',
            },
          });
        }

        // Assigning Token
        const payloadData = {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
          profile: findUser.profile,
        };
        const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
          expiresIn: '365d',
        });

        return res.json({
          message: 'Logged In !!!',
          access_token: `Bearer ${token}`,
        });
      }

      return res.status(400).json({
        errors: {
          email: 'Sorry No User present !!!',
        },
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages)
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: 'Something went wromg, please try again',
        });
      }
    }
  }

  static async sendingEmail(req, res) {
    try {
      const { email } = req.query;

      const payload = [
        {
          toEmail: email,
          subject: 'Sending Email From function1',
          body: `<h1>Hello World !!! Email1 </h1>`,
        },
        {
          toEmail: email,
          subject: 'Sending Email From function2',
          body: `<h1>Hello World !!! Email2 </h1>`,
        },
        {
          toEmail: email,
          subject: 'Sending Email From function3',
          body: `<h1>Hello World !!! Email3 </h1>`,
        },
        {
          toEmail: email,
          subject: 'Sending Email From function4',
          body: `<h1>Hello World !!! Email4 </h1>`,
        },
      ];

      // await sendEmail(payload.toEmail, payload.subject, payload.body);
      // await sendEmail(payload.toEmail, 'Another Mail', payload.bodyTemp);

      await emailQueue.add(emailQueueName, payload);

      return res.status(200).json({ message: 'Mail/JOb Sent Successfully ' });
    } catch (error) {
      console.log(error);
      logger.error({ type: 'Email Error', body: error });
      return res.status(500).json({ message: 'Something went wrong !!!' });
    }
  }
}

export default AuthController;
