import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
      navigate("/login");
      return;
    }

    const roleLower = role.toLowerCase();

    if (roleLower === "borrower") navigate("/borrower");
    else if (roleLower === "lender") navigate("/lender");
    else if (roleLower === "admin") navigate("/admin");
    else navigate("/login");
  }, [navigate]);

  return null; // nothing to render
};

export default Dashboard;
