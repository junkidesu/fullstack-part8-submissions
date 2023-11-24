import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, { data }] = useMutation(LOGIN);

  useEffect(() => {
    if (data) {
      console.log(data.login.value);
      setToken(data.login.value);
      localStorage.setItem("user-token", data.login.value);
    }
  }, [data, setToken]);

  const handleLogin = (e) => {
    e.preventDefault();

    login({
      variables: {
        username,
        password,
      },
    });

    setUsername("");
    setPassword("");
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        username{" "}
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        password{" "}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button>login</button>
    </form>
  );
};

export default LoginForm;
