const { PubSub } = require("graphql-subscriptions");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const pubsub = new PubSub();

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
    genres: async () => {
      const books = await Book.find({});

      const genres = [...new Set(books.map((b) => b.genres).flat())];

      return genres;
    },
    allAuthors: async () => Author.find({}).populate("bookCount"),
    authorCount: async () => Author.collection.countDocuments(),
    me: (_root, _args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (_root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

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

      pubsub.publish("BOOK_ADDED", { bookAdded: newBook });

      return newBook;
    },
    editAuthor: async (_root, { name, setBornTo }, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

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
    login: async (_root, { username, password }) => {
      const user = await User.findOne({ username });

      if (!user || password !== "password")
        throw new GraphQLError("Username or password incorrect", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });

      const userForToken = {
        username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
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
    bookCount: ({ bookCount }) => bookCount,
  },
  User: {
    username: ({ username }) => username,
    favoriteGenre: ({ favoriteGenre }) => favoriteGenre,
  },
  Token: {
    value: ({ value }) => value,
  },
};

module.exports = resolvers;
