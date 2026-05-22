import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { useRouter, getDestinationIdFromPath } from "./hooks/useRouter";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Destinations } from "./pages/Destinations";
import { DestinationDetail } from "./pages/DestinationDetail";
import { Contact } from "./pages/Contact";
import { Login } from "./pages/Login";
import { UserDashboard } from "./pages/UserDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { useAuth } from "./contexts/AuthContext";

function AppContent() {
  const { currentPath, navigate } = useRouter();
  const { isAdmin, loading } = useAuth();

  const renderPage = () => {
    // Admin route — redirect non-admins
    if (currentPath === "/admin") {
      if (!loading && !isAdmin) {
        navigate("/");
        return null;
      }
      return <AdminDashboard onNavigate={navigate} />;
    }

    if (currentPath === "/" || currentPath === "") return <Home onNavigate={navigate} />;
    if (currentPath === "/about") return <About onNavigate={navigate} />;
    if (currentPath === "/destinations") return <Destinations onNavigate={navigate} />;

    if (currentPath.startsWith("/destination/")) {
      const destinationId = getDestinationIdFromPath(currentPath);
      if (destinationId) {
        return <DestinationDetail destinationId={destinationId} onNavigate={navigate} />;
      }
    }

    if (currentPath === "/contact") return <Contact />;
    if (currentPath === "/login") return <Login onNavigate={navigate} />;

    // User dashboard (and backward-compat alias)
    if (currentPath === "/dashboard" || currentPath === "/my-bookings") {
      return <UserDashboard onNavigate={navigate} />;
    }

    return <Home onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={navigate} currentPath={currentPath} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
