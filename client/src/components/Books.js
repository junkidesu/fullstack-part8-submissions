import { useQuery } from "@apollo/client";
import { ALL_BOOKS, GENRES } from "../queries";
import { useState } from "react";

const Books = () => {
  const [genre, setGenre] = useState(null);

  const { data: booksData, loading: booksLoading } = useQuery(ALL_BOOKS, {
    variables: {
      genre,
    },
  });
  const { data: genresData, loading: genresLoading } = useQuery(GENRES);

  if (booksLoading || genresLoading) return <div>Loading...</div>;

  const books = booksData.allBooks;
  const genres = genresData.genres;

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
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
