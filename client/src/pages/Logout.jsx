import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Redirect to login
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
}

export default Logout;

