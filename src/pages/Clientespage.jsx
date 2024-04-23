import { useEffect, useMemo, useRef, useState } from "react"
import { supabase } from "../supabase/client"

import Layout from "../components/Layout"
import Modal from "../components/Modal"
import Table from "../components/Table"
import ClientesForm from "../components/forms/ClientesForm";
import ActualizarClientesForm from "../components/forms/ActualizarClientesForm"

const Clientespage = () => {
    const [isModal, setIsModal] = useState(false)
    const [modalReload, setModalReload] = useState(false)
    // const [isValidateDocumento, setIsValidateDocumento] = useState(false)
    // const [documentoTipo, setDocumentoTipo] = useState([])
    // const [formData, setFormData] = useState([])
    const [idClient, setIdClient] = useState()
    const [dataClientes, setDataClientes] = useState([])
    // const formRef = useRef()

    useEffect(() => {
        // getDocumentoTipo()
        getClientes()
    }, [])

    // useEffect(() => {
    //   if (formData.id) {
    //     getCliente(formData.id)
    //   }
    // }, [formData.id])

    const columns = useMemo(() => [
        {
            header: "#",
            cell: ({ cell }) => {
                const { row } = cell;
                return `${row.index + 1}`
            }
        },
        {
            header: "Tipo",
            accessorFn: (row) => `${row.cliente_tipo_de_documento.abreviatura || ""}`
        },
        {
            header: "Número",
            accessorKey: "documento"
        },
        {
            header: "Denominación/Nombre",
            accessorKey: "razon_social"
        },
        {
            header: "Dirección Fiscal",
            accessorKey: "direccion_fiscal"
        },
        {
            header: "Email",
            cell: ({cell}) => {
                const email = cell.row.original.email
                return <span className="lowercase">{email}</span>
            }
        },
        {
            header: "Acciones",
            cell: ({ cell }) => {
                const id = cell.row.original.id
                return <div className="flex items-center">
                    <button
                        className="text-xs text-primary/70 px-2 py-1 hover:text-primary hover:underline"
                        onClick={() => {
                            // setFormData({
                            //     ...formData,
                            //     id: id,
                            // })
                            setIdClient(id)
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

    // const getCliente = async (id) => {
    //     const { data: cliente, error } = await supabase
    //         .from("clientes")
    //         .select()
    //         .eq("id", id)
    //         .single()
    //     if (error) return console.log(error)
    //     setFormData(cliente)
    // }

    const getClientes = async () => {
        const { data: clientes, error } = await supabase
            .from("clientes")
            .select(`
                id,
                id_tipo_documento,
                documento,
                razon_social,
                direccion_fiscal,
                email,
                cliente_tipo_de_documento (
                    abreviatura
                )
            `)
            .order("created_at", { ascending: true })
        if (error) return console.log(error)
        setDataClientes(clientes)
    }

    // const getDocumentoTipo = async () => {
    //     const { data: documentoTipo, error } = await supabase
    //         .from("cliente_tipo_de_documento")
    //         .select("id, codigo, descripcion")
    //         .order("created_at", { ascending: true })
    //     if (error) return console.log(error)
    //     const options = documentoTipo.map(({ id, codigo, descripcion }) => ({
    //         value: id,
    //         label: codigo + " " + descripcion
    //     }))
    //     setDocumentoTipo(options)
    // }

    // const handleConsultaDocumento = async () => {
    //     const numero = formData.documento.replace(/\s/g, "") // quitamos espacio en blanco
    //     const numeroTam = numero.length
    //     if (+numeroTam !== 8 && +numeroTam !== 11) {
    //         alert("El número de documento es inválido")
    //         setIsValidateDocumento(false)
    //         return
    //     }
    //     setIsValidateDocumento(true)
    //     const apiRuta = numeroTam === 8 ? "consulta_dni.php" : "consulta_ruc.php"
    //     // console.log("first")
    //     const formDataPost = new FormData()
    //     formDataPost.append("numero", numero)
    //     const url = "https://camara-arequipa.org.pe/api/" + apiRuta
    //     fetch(url, {
    //         method: "POST",
    //         body: formDataPost
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //             const res = JSON.parse(data)
    //             let razon = ""
    //             res.direccion === undefined && ""
    //             if (res.razonSocial === undefined) {
    //                 razon = res.apellidoPaterno + " " + res.apellidoMaterno + " " + res.nombres
    //             } else {
    //                 razon = res.razonSocial
    //             }
    //             setFormData({
    //                 ...formData,
    //                 razon_social: razon,
    //                 direccion_fiscal: res.direccion,
    //             })
    //         })
    // }

    // const handleSubmit = async (e) => {
    //     e.preventDefault()
    //     const numero = formData.documento.replace(/\s/g, "") // quitamos espacio en blanco
    //     const numeroTam = numero.length
    //     if (+numeroTam !== 8 && +numeroTam !== 11) {
    //         alert("El número de documento es inválido")
    //         return
    //     }
    //     if (formData.id_tipo_documento === undefined) {
    //         alert("Seleccione el tipo de documento")
    //         return
    //     }
    //     if(formData.id !== undefined){
    //         const { error } = await supabase
    //             .from("clientes")
    //             .update([formData])
    //             .eq("id", formData.id)
    //         if (error) console.log(error)
    //         toast.success("Cliente actualizado correctamente")
    //     }else{
    //         const { error } = await supabase
    //             .from("clientes")
    //             .insert([formData])
    //         if (error) console.log(error)
    //         // console.log(formData)
    //         toast.success("Cliente registrado correctamente")
    //     }
    //     await getClientes()
    //     formRef.current.reset()
    //     setIsModal(false)
    // }

    return (
        <>
            <Layout>
                <div className="py-5 flex flex-col gap-2">
                    <h1 className="text-3xl font-light">Clientes</h1>`
                    <Table data={dataClientes} columns={columns} >
                        <div className="flex items-center gap-x-2">
                        <button
                            className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center"
                            onClick={() => {
                                setIdClient(null)
                                setIsModal(true)
                            }}
                        >
                            Nuevo cliente
                        </button>
                        <button
                            className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center"
                            onClick={() => {
                                setModalReload(true)
                            }}
                        >
                            Actualizar clientes
                        </button>
                        </div>
                    </Table>
                </div>
            </Layout>
            <Modal isOpen={isModal} onClose={() => setIsModal(false)}>
                <h1 className="text-3xl">Nuevo cliente</h1>
                <ClientesForm id={idClient} getClientes={getClientes} setIsModal={setIsModal} />
            </Modal>
            <Modal isOpen={modalReload} onClose={() => setModalReload(false)}>
                <h1 className="text-3xl">Actualizar clientes</h1>
                <ActualizarClientesForm setIsModal={setModalReload} />
            </Modal>
        </>
    )
}

export default Clientespage