import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppRoutes from "./routes/app-routes.jsx";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;
  }, [location.pathname, navigate]);

  return (
      <AppRoutes />
  );
}

export default App;