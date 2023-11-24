import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommendations = () => {
  const { data: userData, loading: userLoading } = useQuery(ME);
  const { data: booksData, loading: booksLoading } = useQuery(ALL_BOOKS, {
    variables: {
      genre: userData ? userData.me.favoriteGenre : undefined,
    },
    skip: !userData,
  });

  if (booksLoading || userLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre{" "}
        <strong>{userData.me.favoriteGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksData.allBooks.map((a) => (
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
