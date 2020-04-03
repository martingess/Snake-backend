const express = require('express');
const mongoose = require('mongoose');
const resultRoutes = require('./routes/resultRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();
const expressGraphql = require('express-graphql');
const jwt = require('jsonwebtoken');
const schema = require('./graphql/schema')
const root = require('./graphql/resolvers')
const User = require('./models/userModel')
const cors = require('cors')

const config = {
  jwtSecret: 'ageirusjbjbieiqoepvhjasdoigur831ODideR'
}

//MONGOOSE
mongoose.connect('mongodb://localhost:27018/snake-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//PATHS & middlewares
app.use(cors())
app.use(express.json());
app.use(express.static('public'));
app.use(userAuthorizationMiddleware)
app.use('/api/v1/result', resultRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/graphql', expressGraphql(async (req, res) => {
  const jwt = jwtCheck(req, config.jwtSecret);
  if (jwt) {
    console.log("Содержимое джвт: ", jwt)
    const thisUser = await User.findOne({_id: jwt._id})
    return ({
      schema: schema,
      rootValue: root,
      graphiql: true,
      context: {
        jwt,
        thisUser
      }
    })
  }
  return ({
    schema,
    rootValue: root,
    graphiql: true
  })
}));

//additional functions
function jwtCheck(req, secret) {
  const authorization = req && req.headers && req.headers.authorization

  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.substr("Bearer ".length)
    let decoded;
    try {
      decoded = jwt.verify(token, secret)
    } catch (e) {
      return null;
    }
    return decoded
  }
}

function userAuthorizationMiddleware(req, res, next){
  if(req && req.headers && req.headers.authorization){
    const token = req.headers.authorization.substr("Bearer ".length)
    if (token == "undefined") next()
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (e) {
      return null;
    }
    req.user = decoded;
  }
  next()
}

//SERVER
const port = 3022;
app.listen(port, () => console.log(`Server is runing on ${port}`));