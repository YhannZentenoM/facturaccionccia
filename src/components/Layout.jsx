import { Link } from "react-router-dom";
import { useUserAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { signOut } = useUserAuth();

  return (
    <div className="bg-zinc-100 min-h-screen flex flex-col justify-between">
      <nav className="w-full py-4 bg-gradient-to-r from-primary to-[#5c717c] flex justify-between items-center px-5 text-sm">
        <div
          className="h-10 w-10 bg-no-repeat bg-cover rounded-md"
          style={{ backgroundImage: "url('/logo_header.webp')" }}
        ></div>
        <ul className="flex items-center justify-center gap-5 text-white">
          <li>
            <Link
              to={"/home"}
              className="relative before:absolute before:-bottom-1 before:left-0 before:w-full before:border before:border-b before:border-zinc-100 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300"
            >
              Comprobantes
            </Link>
          </li>
          <li>
            <Link
              to={"/"}
              className="relative before:absolute before:-bottom-1 before:left-0 before:w-full before:border before:border-b before:border-zinc-100 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 pointer-events-none cursor-not-allowed"
            >
              Reportes
            </Link>
          </li>
          <li>
            <Link
              to={"/clientes"}
              className="relative before:absolute before:-bottom-1 before:left-0 before:w-full before:border before:border-b before:border-zinc-100 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300"
            >
              Clientes
            </Link>
          </li>
          <li>
            <Link
              to={"/productos"}
              className="relative before:absolute before:-bottom-1 before:left-0 before:w-full before:border before:border-b before:border-zinc-100 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300"
            >
              Productos
            </Link>
          </li>
          <li>
            <Link
              to={"/"}
              className="relative before:absolute before:-bottom-1 before:left-0 before:w-full before:border before:border-b before:border-zinc-100 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 pointer-events-none cursor-not-allowed"
            >
              Configuración
            </Link>
          </li>
        </ul>
        <button
          type="button"
          className="px-3 p-1 rounded-xl border border-zinc-100 text-zinc-100 hover:bg-zinc-100 hover:text-primary transition-all duration-300"
          onClick={signOut}
        >
          Cerrar Sesión
        </button>
      </nav>
      <main className="lg:container mx-auto flex-1">{children}</main>
      <footer className="bg-zinc-200/50 border border-t border-secondary/60 px-5 py-3 text-sm text-black/60 flex items-center justify-between">
        <p>
          Desarrollado por: Cámara de Comercio e Industria de Arequipa - 2024
        </p>
        <p>Versión: 1.0.0</p>
      </footer>
    </div>
  );
};

export default Layout;
