import { Outlet } from "react-router-dom"
import Layout from "../components/Layout"

const ComprobantePage = () => {
    return (
        <>
            <Layout>
                <div className="py-5 flex flex-col gap-2">
                    <h1 className="text-3xl font-light">Emisión de comprobantes</h1>
                    <Outlet />
                </div>
            </Layout>
        </>
    )
}

export default ComprobantePage