import { UserModel } from '*/models/user.model'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import {pick} from 'lodash'
const createNew = async (data) => {
  try {
    // check email have already in system yet ? 
    const existUser = await UserModel.findOneByEmail(data.email)
    if(existUser) {
      throw new Error('Email already exist.') 
    }

    // create database for the user inorder to save database
    // nameFromEmail: nếu email là trungquandev@gmail.com thì sẽ lấy được "trungquandev"
    const nameFromEmail = data.email.split('@')[0] || ''
    const userData = {
      email: data.email,
      password: bcryptjs.hashSync(data.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    const createdUser = await UserModel.createNew(userData)
    const getUser = await UserModel.findOneById(createdUser.insertedId.toString())

    // Send email to the user click verify

    return pick(getUser, ['email', 'username', 'displayName', 'avatar', 'role', 'isActive', 'createdAt', 'updatedAt'])

  } catch (error) {
    throw new Error(error)
  }
}

export const UserService = {
  createNew
}
