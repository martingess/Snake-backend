const {buildSchema} = require('graphql');
const schema = buildSchema(`

enum UserRole {
  doctor
  patient
}

input CreateResult {
  name: String!, 
  date: String, 
  imgsPaths: [String]!, 
  analyzeType: String, 
  doctorName: String
  note: String
}
input CreateUser {
  login: String!, 
  password: String!, 
  name: String, 
  email: String
  role: UserRole
}
input UpdateResult {
  id: String! 
  name: String, 
  date: String, 
  imgsPaths: [String], 
  shareWithDoctor: String, 
  analyzeType: String,
  doctorName: String 
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
  doctorsIds: [String],
  doctorName: String,
  waitingDoctorsConfirmation: [String],
  doctorsComments: [String],
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
  findUserResults: [Result]
  search(query: String!): [Result]
  resultsForApprove: [Result]
  findDoctorResults: [Result]
  checkUsername(username: String!): String
  checkEmail(email: String!): String

}



type Mutation {
  createUser(user: CreateUser): String
  createResult(result: CreateResult): Result
  deleteResult(id: String!): String
  updateResult(result: UpdateResult): String
  deleteUser: String
  updateUser(user: inputUpdateUser): String
  approveResult(id: String!): String
  removeDoctorFromResult(resultId: String!, doctorId: String): String
}
`);

module.exports = schema;