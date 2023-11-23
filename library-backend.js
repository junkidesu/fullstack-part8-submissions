const { ApolloServer } = require("@apollo/server");
const { GraphQLError } = require("graphql");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
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

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    authorCount: Int
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    allBooks: async (_root, { author, genre }) => {
      const foundAuthor = await Author.findOne({ name: author });

      if (foundAuthor && genre)
        return Book.find({ author: foundAuthor._id, genres: genre });

      if (foundAuthor) return Book.find({ author: foundAuthor._id });

      if (genre) return Book.find({ genres: genre });

      return Book.find({});
    },
    allAuthors: async () => Author.find({}),
    authorCount: async () => Author.collection.countDocuments(),
  },
  Mutation: {
    addBook: async (_root, args) => {
      let foundAuthor = await Author.findOne({ name: args.author });

      if (!foundAuthor) {
        foundAuthor = await new Author({
          name: args.author,
          born: null,
        }).save();
      }

      const newBook = new Book({ ...args, author: foundAuthor._id });

      try {
        await newBook.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }

      return newBook;
    },
    editAuthor: async (_root, { name, setBornTo }) => {
      try {
        const editedAuthor = await Author.findOneAndUpdate(
          { name },
          { born: setBornTo },
          { context: "query", new: true }
        );

        return editedAuthor;
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }
    },
    createUser: async (_root, args) => {
      const newUser = new User({ ...args });

      try {
        await newUser.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }

      return newUser;
    },
  },
  Book: {
    title: ({ title }) => title,
    published: ({ published }) => published,
    author: async ({ author }) => Author.findById(author),
    id: ({ id }) => id,
    genres: ({ genres }) => genres,
  },
  Author: {
    name: ({ name }) => name,
    born: ({ born }) => born,
    id: ({ id }) => id,
    bookCount: async ({ name }) => {
      const author = await Author.findOne({ name });

      return Book.collection.countDocuments({ author: author._id });
    },
  },
  User: {
    username: ({ username }) => username,
    favoriteGenre: ({ favoriteGenre }) => favoriteGenre,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: {
    port: 4000,
  },
}).then(({ url }) => console.log(`Server running at ${url}`));
