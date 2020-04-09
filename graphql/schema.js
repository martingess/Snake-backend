const {buildSchema} = require('graphql');
const schema = buildSchema(`
input CreateResult {
  name: String!, 
  date: String, 
  imgsPaths: [String]!, 
  doctorName: String, 
  analyzeType: String, 
  note: String
}
input CreateUser {
  login: String!, 
  password: String!, 
  name: String!, 
  email: String!
}
input UpdateResult {
  id: String!
  name: String, 
  date: String, 
  imgsPaths: String, 
  doctorName: String, 
  analyzeType: String, 
  note: String,
}

input inputUpdateUser {
  password: String!
  newPassword: String
  name: String
  email: String
}

type Result {
  name: String,
  date: String,
  id: String
  imgsPaths: [String],
  doctorName: String,
  analyzeType: String,
  note: String,
  user: User
}
type User {
  id: String,
  name: String,
  login: String,
  email: String,
  avatarPath: String,
  role: String
}

type Query {
  login(username: String!, password: String!): String
  findUser(username: String): User,
  findAllUsers(username: String): [User]
  findUserResults(username: String): [Result]
  search(query: String!): [Result]
}



type Mutation {
  createUser(user: CreateUser): String
  createResult(result: CreateResult): Result
  deleteResult(id: String!): String
  updateResult(result: UpdateResult): String
  deleteUser: String
  updateUser(user: inputUpdateUser): String
}
`);

module.exports = schema;

// 