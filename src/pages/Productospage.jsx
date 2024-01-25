import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabase/client'
import { Toaster, toast } from 'sonner';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Modal from '../components/Modal';
import SelectInput from '../components/SelectInput';

const Productospage = () => {
    const tipoProducto = [
        { value: "NIU", label: 'NIU - PRODUCTO' },
        { value: "ZZ", label: 'ZZ - SERVICIO' },
    ]

    const [isModal, setIsModal] = useState(false)
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        // const { data: producto, error } = await supabase
        //     .from('productos')
        //     .insert({
        //         codigo: formData.codigo,
        //         nombre: formData.nombre,
        //         precio_venta: formData.precio_venta,
        //         centro_costos_id: formData.centro_costos_id,
        //     })
        // if (error) return toast(error.message, 'error')
        // toast('Producto creado correctamente', 'success')
        // setIsModal(false)
        // getProductos()
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
            <Modal isOpen={isModal} onClose={() => setIsModal(false)}>
                <h1 className='text-3xl'>Nuevo producto</h1>
                <form onSubmit={handleSubmit} ref={formRef}>
                    <div className='grid grid-cols-2 mt-2 gap-x-5 gap-y-2'>
                        <label className='flex flex-col gap-1 text-sm text-zinc-500'>
                            Código
                            <input
                                type="text"
                                name='codigo'
                                className='py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg'
                                value={formData.codigo || ''}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            />
                        </label>
                        <label className='flex flex-col gap-1 text-sm text-zinc-500'>
                            Tipo
                            <SelectInput
                                name='unidad_de_medida'
                                options={tipoProducto}
                                onChange={(e) => setFormData({ ...formData, unidad_de_medida: e.value })}
                            // selected={documentoTipo[indice]}
                            // value={formData.tipo || ''}
                            />
                        </label>
                        <label className='flex flex-col gap-1 text-sm text-zinc-500'>
                            Centro de costos
                            <SelectInput
                                name='centro_costos_id'
                                options={documentoTipo}
                                onChange={(e) => setFormData({ ...formData, centro_costos_id: e.value })}
                            // selected={documentoTipo[indice]}
                            // value={formData.tipo || ''}
                            />
                        </label>
                        <label className='flex flex-col gap-1 text-sm text-zinc-500'>
                            Precio inc. IGV
                            <input
                                type="text"
                                name='precio'
                                className='py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg'
                                value={formData.precio || ''}
                                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            />
                        </label>
                        <label className='flex flex-col gap-1 text-sm text-zinc-500 col-span-2'>
                            Nombre del producto o servicio
                            <input
                                type="text"
                                name='nombre'
                                className='py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg'
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </label>
                    </div>
                    <button
                        type='submit'
                        className="text-white mt-5 bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center w-full"
                    >
                        Guardar
                    </button>
                </form>`
            </Modal>
        </>
    )
}

export default Productospage