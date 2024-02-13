// import { useState } from "react"
// import {
//     useReactTable,
//     getCoreRowModel,
//     flexRender,
//     getPaginationRowModel,
//     getSortedRowModel,
//     getFilteredRowModel
// } from "@tanstack/react-table"
import Layout from "../components/Layout"
import Table from "../components/Table"
import { Link } from "react-router-dom"

const Homepage = () => {
    // const [sorting, setSorting] = useState([])
    // const [filtering, setFiltering] = useState("")

    const data = [
    ]

    const columns = [
        {
            header: "Fecha",
            accessorKey: "fecha"
        },
        {
            header: "Tipo",
            accessorKey: "tipo"
        },
        {
            header: "Serie",
            accessorKey: "serie"
        },
        {
            header: "Num.",
            accessorKey: "numero"
        },
        {
            header: "Ruc, DNI",
            accessorKey: "ruc"
        },
        {
            header: "Denominación",
            accessorKey: "denominacion"
        },
        {
            header: "M",
            accessorKey: "moneda"
        },
        {
            header: "Total",
            accessorKey: "total"
        },
        {
            header: "Acciones",
            accessorKey: "acciones"
        }
    ]

    // const table = useReactTable({
    //     data,
    //     columns,
    //     getCoreRowModel: getCoreRowModel(),
    //     getPaginationRowModel: getPaginationRowModel(),
    //     getSortedRowModel: getSortedRowModel(),
    //     getFilteredRowModel: getFilteredRowModel(),
    //     state: {
    //         sorting: sorting,
    //         globalFilter: filtering
    //     },
    //     onSortingChange: setSorting,
    //     onGlobalFilterChange: setFiltering
    // })

    return (
        <Layout>
            <div className="py-5 flex flex-col gap-2">
                <h1 className="text-3xl font-light">Comprobantes Electrónicos</h1>
                <Table data={data} columns={columns} >
                    <Link
                        to="/comprobantes/nuevo"
                        className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center"
                    >
                        Emitir nuevo comprobante
                    </Link>
                </Table>
            </div>
        </Layout>
    )
}

export default Homepage