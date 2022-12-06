import { UserModel } from '*/models/user.model'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import {SendInBlueProvider} from '*/providers/SendInBlueProvider'



import { WEBSITE_DOMAIN } from '*/utilities/constants'
import { pickUser } from '../utilities/transform'
import { JwtProvider } from '../providers/JwtProvider'
import { CloudinaryProvider } from '../providers/CloudinaryProvider'
import { env } from '*/config/environtment'

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

const signIn = async (data) => {
  try {
    const existUser = await UserModel.findOneByEmail(data.email)
    if(!existUser) {
      throw new Error('Email does not exsist.') 
    }
    if(!existUser.isActive){
      throw new Error('Your account is not active.')
    }
    
    //Compare password
    if(!bcryptjs.compareSync(data.password, existUser.password)){
      throw new Error('Your password is incorrect')
    }

    const userInfoToStoreInJwtToken = {
      _id: existUser._id,
      email: existUser.email
    }

    // handle tokens
    const accessToken = await JwtProvider.generateToken(
      env.ACCESS_TOKEN_SECRET_SIGNATURE, 
      env.ACCESS_TOKEN_SECRET_LIFE,
      // 5,  //để dành test
      userInfoToStoreInJwtToken
    )

    const refreshToken = await JwtProvider.generateToken(
      env.REFRESH_TOKEN_SECRET_SIGNATURE, 
      env.REFRESH_TOKEN_SECRET_LIFE,
      // 15, //để dành test
      userInfoToStoreInJwtToken
    )

    return { accessToken, refreshToken, ...pickUser(existUser)}

  } catch (error) {
    throw new Error(error)
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // verify // giải mã token 
    const refreshTokenDecoded = await JwtProvider.verifyToken(env.REFRESH_TOKEN_SECRET_SIGNATURE, clientRefreshToken)
    // pull request 11/15/2022
    const userInfoToStoreInJwtToken = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // handle tokens
    const accessToken = await JwtProvider.generateToken(
      env.ACCESS_TOKEN_SECRET_SIGNATURE, 
      env.ACCESS_TOKEN_SECRET_LIFE, 
      // 5, //để dành test
      userInfoToStoreInJwtToken
    )
    
    return {accessToken}
  } catch (error) {
    throw new Error(error)
  }
}

const update = async ( userId, data, userAvatarFile ) => {
  try {
    let updatedUser = {}

    if (userAvatarFile) {
      // Upload file len cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      console.log(uploadResult)

      updatedUser = await UserModel.update(userId, {
        avatar: uploadResult.secure_url
      })

    } else if (data.currentPassword && data.newPassword) {
      // change password
      const existUser = await UserModel.findOneById(userId)
      if(!existUser) {
        throw new Error('User not found.') 
      }
       //Compare password
      if(!bcryptjs.compareSync(data.currentPassword, existUser.password)){
        throw new Error('Your current password is incorrect!')
      }

      updatedUser = await UserModel.update(userId, {
        password: bcryptjs.hashSync(data.newPassword, 8)
      })

    } else {
      // general info user
      updatedUser = await UserModel.update(userId, {
        displayName: data.displayName
      })
    }

    return pickUser(updatedUser)
  } catch (error) {
    throw new Error(error)
  }
}

export const UserService = {
  createNew,
  verifyAccount,
  signIn,
  refreshToken,
  update
}
