import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommendations = () => {
  const booksQuery = useQuery(ALL_BOOKS);
  const meQuery = useQuery(ME);

  if (booksQuery.loading || meQuery.loading) return <div>Loading...</div>;

  const books = booksQuery.data.allBooks;

  const genres = [
    ...new Set(
      books
        .map((b) => b.genres)
        .flat()
        .values()
    ),
  ];

  const favoriteGenre = meQuery.data.me.favoriteGenre;
  const booksToShow = books.filter((b) => b.genres.includes(favoriteGenre));

  console.log(genres);

  return (
    <div>
      <h2>recommendations</h2>

      <p>books in your favorite genre {favoriteGenre}</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
