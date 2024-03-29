import { useUserAuth } from "../context/AuthContext"

const Login = () => {

    const {signInWithEmail, error} = useUserAuth()

    const handleSubmit = (e) => {
        e.preventDefault()
        const { elements } = e.currentTarget
        const email = elements.namedItem("email").value.trim()
        const password = elements.namedItem("password").value
        signInWithEmail(email, password)
    }

    return (
        <section className="bg-gradient-to-r from-primary to-[#5c717c]">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center justify-center p-1 mb-6 rounded-md bg-white">
                    <img className="w-[200px]" src="/logo_header.webp" alt="logo" />
                </a>
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-700 md:text-2xl">
                            Ingresa con tu cuenta
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">E-mail</label>
                                <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="nombre@cciarequipa.org" required={true} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
                                <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required={true} />
                            </div>
                            <button type="submit" className="w-full text-white bg-primary hover:bg-primary/90 focus:ring-1 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center">Ingresar</button>
                            {
                                error && <p className="text-red-500 text-center text-sm">{error}</p>
                            }
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login