import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabase/client'
import { Toaster, toast } from 'sonner';
import Layout from '../components/Layout';
import Table from '../components/Table';

const Productospage = () => {
    const [isModal, setIsModal] = useState(false)
    const [isValidateDocumento, setIsValidateDocumento] = useState(false)
    const [documentoTipo, setDocumentoTipo] = useState([])
    const [formData, setFormData] = useState([])
    const [dataProductos, setDataProductos] = useState([])
    const formRef = useRef()

    useEffect(() => {
        // getDocumentoTipo()
        getProductos()
    }, [])

    const columns = useMemo(() => [
        {
            header: '#',
            cell: ({ cell }) => {
                const { row } = cell;
                return `${row.index + 1}`
            }
        },
        {
            header: 'Código',
            accessorKey: 'codigo'
        },
        {
            header: 'Número',
            accessorKey: 'nombre'
        },
        {
            header: 'Precio',
            accessorKey: 'precio_venta'
        },
        {
            header: 'Centro de costo',
            accessorFn: (row) => `${row.centro_costos.nombre || ''}`
        },
        {
            header: 'Acciones',
            cell: ({ cell }) => {
                const id = cell.row.original.id
                return <div className='flex items-center'>
                    <button
                        className="text-xs text-primary/70 px-2 py-1 hover:text-primary hover:underline"
                        onClick={() => {
                            setFormData({
                                ...formData,
                                id: id,
                            })
                            setIsModal(true)
                        }}
                    >
                        Editar
                    </button>
                    <button
                        className="text-xs text-red-800/70 px-2 py-1 hover:text-red-800 hover:underline"
                        // onClick={() => handleDeletePerson(id)}
                    >
                        Eliminar
                    </button>
                </div>
            }
        }
    ], [])

    const getProductos = async () => {
        const { data: productos, error } = await supabase
            .from('productos')
            .select(`
                id,
                codigo,
                nombre,
                precio_venta,
                centro_costos (
                    nombre
                )
            `)
            .order('created_at', { ascending: true })
        if (error) return console.log(error)
        setDataProductos(productos)
    }

    return (
        <>
            <Layout>
                <Toaster position="top-right" />
                <div className="py-5 flex flex-col gap-2">
                    <h1 className="text-3xl font-light">Productos</h1>`
                    <Table data={dataProductos} columns={columns} >
                        <button
                            className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center"
                            onClick={() => setIsModal(true)}
                        >
                            Nuevo producto
                        </button>
                    </Table>
                </div>
            </Layout>
        </>
    )
}

export default Productospage