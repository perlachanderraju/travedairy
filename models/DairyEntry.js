class DiaryEntry {
  constructor(diaryEntryModel) {
    this.diaryEntryModel = diaryEntryModel
  }

  async createEntry(entryData) {
    try {
      // Add validation logic here
      const newEntry = await this.diaryEntryModel.create(entryData)
      return newEntry
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getEntry(entryId) {
    try {
      const entry = await this.diaryEntryModel.findById(entryId)
      if (!entry) {
        throw new Error('Entry not found')
      }
      return entry
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateEntry(entryId, newData) {
    try {
      const updatedEntry = await this.diaryEntryModel.findByIdAndUpdate(
        entryId,
        newData,
        {new: true},
      )
      return updatedEntry
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteEntry(entryId) {
    try {
      const deletedEntry = await this.diaryEntryModel.findByIdAndDelete(entryId)
      return deletedEntry
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

module.export = DairyEntry
