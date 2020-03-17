const { Schema } = require("mongoose")

module.exports =  class FindOrCreateSchema extends Schema {
  constructor(data) {
    super(data);

    this.static("findOrCreate", async function(doc) {
      return await this.findOne(doc) || await this.create(doc);
    })
  }
}