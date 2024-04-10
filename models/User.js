class User {
  constructor(userModel) {
    this.userModel = userModel
  }

  async registerUser(userData) {
    try {
      // Add validation logic here
      const newUser = await this.userModel.create(userData)
      return newUser
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async loginUser(username, password) {
    try {
      const user = await this.userModel.findOne({username})
      if (!user || user.password !== password) {
        throw new Error('Invalid credentials')
      }

      // Generate JWT token
      const token = generateToken(user.id)
      return token
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateProfile(userId, newData) {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        newData,
        {new: true},
      )
      return updatedUser
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.export = User
