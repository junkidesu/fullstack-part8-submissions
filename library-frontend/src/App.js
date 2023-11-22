import Authors from "./components/Authors";
import Books from "./components/Books";
import EditBirthYear from "./components/EditBirthYear";
import NewBook from "./components/NewBook";
import { Route, Routes, Link } from "react-router-dom";

const App = () => {
  return (
    <div>
      <div>
        <Link to="/authors">
          <button>Authors</button>
        </Link>
        <Link to="/">
          <button>Books</button>
        </Link>
        <Link to="/add">
          <button>Add book</button>
        </Link>
        <Link to="/edit">
          <button>Edit Birthyear</button>
        </Link>
      </div>

      <Routes>
        <Route path="/authors" element={<Authors />} />
        <Route path="/" element={<Books />} />
        <Route path="/add" element={<NewBook />} />
        <Route path="/edit" element={<EditBirthYear />} />
      </Routes>
    </div>
  );
};

export default App;
