import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
  <div style={{ marginBottom: "20px" }}>
    <Link to="/">Jobs</Link> |{" "}
    <Link to="/dashboard">Dashboard</Link> |{" "}

    {role === "hr" && <Link to="/post-job">Post Job</Link>} |{" "}

    {token ? (
      <button onClick={logout}>Logout</button>
    ) : (
      <>
        <Link to="/login">Login</Link> |{" "}
        <Link to="/register">Register</Link>
      </>
    )}
  </div>
);
}

export default Navbar;
