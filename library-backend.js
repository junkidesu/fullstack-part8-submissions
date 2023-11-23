const { ApolloServer } = require("@apollo/server");
const { GraphQLError } = require("graphql");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");

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

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

/*
  you can remove the placeholder query once your first one has been implemented 
*/

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

  type Query {
    bookCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    authorCount: Int
  }

  type Mutation {
    addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
    editAuthor(name: String!, setBornTo: Int!): Author
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
