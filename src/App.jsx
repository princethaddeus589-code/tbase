import { useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import PlayerBar from "./components/PlayerBar";
export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">T base</div>;
  if (!user) return <Auth />;
  return (<><Home /><PlayerBar /></>);
}
