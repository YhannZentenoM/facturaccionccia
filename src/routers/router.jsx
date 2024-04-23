import { Route, Routes } from "react-router-dom"
import { Clientespage, Homepage, Login } from "../pages"
import ComprobantePage from "../pages/ComprobantePage"
import ComprobanteNuevoPage from "../pages/ComprobanteNuevoPage"
import Productospage from "../pages/Productospage"

const RouterApp = () => {
  return (
    <Routes>
        <Route path={"/"} element={<Login />} />
        <Route exact path={"/home"} element={<Homepage />} />
        <Route exact path={"/clientes"} element={<Clientespage />} />
        <Route exact path={"/productos"} element={<Productospage />} />
        <Route exact path={"/comprobantes"} element={<ComprobantePage />} >
          <Route exact path={"nuevo"} element={<ComprobanteNuevoPage />} />
          <Route exact path={":id"} element={<h1>Comprobante</h1>} />
        </Route>
        <Route exact path={"*"} element={<h1>Not Found</h1>} />
      </Routes>
  )
}

export default RouterApp