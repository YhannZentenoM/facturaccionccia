import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <div className='bg-zinc-100 min-h-screen'>
            <nav className="w-full py-4 bg-zinc-200 flex justify-between items-center px-5 text-sm" >
                <h1 className='font-bold text-lg'>CCIA</h1>
                <ul className="flex items-center justify-center gap-5">
                    <li>
                        <Link
                            to={"/"}
                            className='hover:border-b hover:border-primary transition-all duration-300'>
                            Inicio
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={"/"}
                            className='hover:border-b hover:border-primary transition-all duration-300'>
                            Reportes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={"/clientes"}
                            className='hover:border-b hover:border-primary transition-all duration-300'>
                            Clientes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={"/productos"}
                            className='hover:border-b hover:border-primary transition-all duration-300'>
                            Productos
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={"/"}
                            className='hover:border-b hover:border-primary transition-all duration-300'>
                            Configuración
                        </Link>
                    </li>
                </ul>
                <Link to={"/"} className='px-3 p-1 rounded-xl bg-primary text-white'>Cerrar Sessión</Link>
            </nav>
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    )

}

export default Layout;
