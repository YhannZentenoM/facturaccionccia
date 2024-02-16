import { Route, Routes } from "react-router-dom"
import { Clientespage, Homepage, Login } from "../pages"
import ComprobantePage from "../pages/ComprobantePage"
import ComprobanteNuevoPage from "../pages/ComprobanteNuevoPage"
import Productospage from "../pages/Productospage"

const RouterApp = () => {
  return (
    <Routes>
        <Route path={"/"} element={<Login />} />
        <Route path={"/home"} element={<Homepage />} />
        <Route path={"/clientes"} element={<Clientespage />} />
        <Route path={"/productos"} element={<Productospage />} />
        <Route path={"/comprobantes"} element={<ComprobantePage />} >
          <Route path={"nuevo"} element={<ComprobanteNuevoPage />} />
          <Route path={":id"} element={<h1>Comprobante</h1>} />
        </Route>
        <Route path={"*"} element={<h1>Not Found</h1>} />
      </Routes>
  )
}

export default RouterApp