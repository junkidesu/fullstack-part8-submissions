const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB", error.message);
  });

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;

    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.replace("Bearer ", "");

      const decodedToken = jwt.verify(token, process.env.SECRET);

      const currentUser = await User.findById(decodedToken.id);

      return { currentUser };
    }
  },
}).then(({ url }) => console.log(`Server running at ${url}`));
