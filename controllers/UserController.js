import { generateRandomNum, imageValidator } from '../utils/Helper.js';
import prisma from '../db/db.config.js';

class UserController {
  static async getUser(req, res) {
    try {
      const user = req.user;
      return res.json({ status: 200, user });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong !!!' });
    }
  }

  static async createUser() {}

  static async showUser() {}

  static async updateUserProfileById(req, res) {
    try {
      const { id } = req.params;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: 'Profile Image is required !!!' });
      }

      // Grabbing the Profile
      const profile = req.files.profile;
      // Based on Documentation
      const message = imageValidator(profile?.size, profile?.mimetype);

      if (!(message === null)) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }

      // Splitting the name
      const imgExt = profile?.name.split('.');
      const imageName = generateRandomNum() + '.' + imgExt[1];
      const uploadpath = process.cwd() + '/public/images/' + imageName;

      // uploading based on Documentation
      profile.mv(uploadpath, (err) => {
        if (err) {
          throw err;
        }
      });

      // Updating the Profile
      await prisma.users.update({
        data: {
          profile: imageName,
        },
        where: {
          id: Number(id),
        },
      });

      return res.json({
        status: 200,
        message: 'Profile Updated Successfully !!!',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong !!!' });
    }
  }

  static async deleteUser() {}
}

export default UserController;
