import { useState } from "react";
import Select from "react-select";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from "../queries";

const EditBirthYear = () => {
  const [author, setAuthor] = useState(null);
  const [born, setBorn] = useState("");

  const { data, loading } = useQuery(ALL_AUTHORS);

  const [editBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (loading) return <div>Loading...</div>;

  const authors = data.allAuthors;
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
      <h3>Set birthyear</h3>

      <form onSubmit={handleUpdateAuthor}>
        <div>
          <Select
            defaultValue={author}
            onChange={setAuthor}
            options={options}
            required
          />
          born <input value={born} onChange={(e) => setBorn(e.target.value)} />
        </div>
        <button>Update author</button>
      </form>
    </div>
  );
};

export default EditBirthYear;
