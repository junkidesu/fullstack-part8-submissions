import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from "../queries";
import Select from "react-select";

const Authors = () => {
  const [author, setAuthor] = useState(null);
  const [born, setBorn] = useState("");

  const result = useQuery(ALL_AUTHORS);
  const [editBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (result.loading) return <div>Loading...</div>;

  const authors = result.data.allAuthors;
  const options = authors.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  const handleUpdateAuthor = (e) => {
    e.preventDefault();

    console.log("editing author...");

    editBirthYear({
      variables: {
        name: author.value,
        born: Number(born),
      },
    });
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h3>Set birthyear</h3>

        <form onSubmit={handleUpdateAuthor}>
          <div>
            <Select
              defaultValue={author}
              onChange={setAuthor}
              options={options}
              required
            />
            born{" "}
            <input value={born} onChange={(e) => setBorn(e.target.value)} />
          </div>
          <button>Update author</button>
        </form>
      </div>
    </div>
  );
};

export default Authors;
