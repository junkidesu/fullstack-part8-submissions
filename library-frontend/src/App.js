import Authors from "./components/Authors";
import Books from "./components/Books";
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
      </div>

      <Routes>
        <Route path="/authors" element={<Authors />} />
        <Route path="/" element={<Books />} />
        <Route path="/add" element={<NewBook />} />
      </Routes>
    </div>
  );
};

export default App;
