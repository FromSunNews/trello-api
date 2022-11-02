import { UserModel } from '*/models/user.model'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import {SendInBlueProvider} from '*/providers/SendInBlueProvider'
import { WEBSITE_DOMAIN } from '*/utilities/constants'
import { pickUser } from '../utilities/transform'
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

    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getUser.email}&token=${getUser.verifyToken}`

    const subject = 'Trello Clone App: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> - Trungquandev Official - </h3>
    `
    await SendInBlueProvider.sendEmail(getUser.email, subject, htmlContent)

    return pickUser(getUser)

  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

const verifyAccount = async (data) => {
  try {
    const existUser = await UserModel.findOneByEmail(data.email)
    if(!existUser) {
      throw new Error('Email do not exsist.') 
    }
    if(existUser.isActive){
      throw new Error('Your account is already active.')
    }
    if(data.token !== existUser.verifyToken){
      throw new Error('Token is invalid!')
    }

    const updateData = {
      verifyToken: null,
      isActive: true
    }

    const updatedUser = await UserModel.update(existUser._id.toString(), updateData)

    console.log(updatedUser)

    return pickUser(updatedUser)

  } catch (error) {
    throw new Error(error)
  }
}

export const UserService = {
  createNew,
  verifyAccount
}
