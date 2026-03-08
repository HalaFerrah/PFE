import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
