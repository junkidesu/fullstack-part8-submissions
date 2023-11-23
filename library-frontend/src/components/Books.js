import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState } from "react";

const Books = () => {
  const [genre, setGenre] = useState(null);

  const result = useQuery(ALL_BOOKS);

  if (result.loading) return <div>Loading...</div>;

  const books = result.data.allBooks;

  const genres = [
    ...new Set(
      books
        .map((b) => b.genres)
        .flat()
        .values()
    ),
  ];

  const booksToShow = genre
    ? books.filter((b) => b.genres.includes(genre))
    : books;

  console.log(genres);

  return (
    <div>
      <h2>books</h2>

      <div>
        {genre && (
          <p>
            in genre <strong>{genre}</strong>
          </p>
        )}
      </div>
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
      {genres.map((g) => (
        <button key={g} onClick={() => setGenre(g)}>
          {g}
        </button>
      ))}
      <button onClick={() => setGenre(null)}>all genres</button>
    </div>
  );
};

export default Books;
