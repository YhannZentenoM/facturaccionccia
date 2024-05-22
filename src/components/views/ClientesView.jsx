import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/supabase/client";
import SelectInput from "@/components/SelectInput";
import { Toaster, toast } from "sonner";

const ClientesView = ({ id, setIsModalVer }) => {
//   const [isValidateDocumento, setIsValidateDocumento] = useState(false);
  const [documentoTipo, setDocumentoTipo] = useState([]);
//   const [selectedDocument, setSelectedDocument] = useState([]);
  const [formData, setFormData] = useState([]);

  const formRef = useRef();

//   useEffect(() => {
//     getDocumentoTipo();
//   }, []);

  useEffect(() => {
    id && getDataClient(id);
  }, [id]);

  const getCliente = async (id) => {
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select()
      .eq("id", id)
      .single();
    if (error) return console.log(error);
    // setFormData(cliente);
    return cliente;
  };

  const getDocumentoTipo = async (id) => {
    const { data: documentoTipo, error } = await supabase
      .from("cliente_tipo_de_documento")
      .select("id, codigo, descripcion")
      .eq("id", id)
      .single()
    if (error) return console.log(error);
    // const options = documentoTipo.map(({ id, codigo, descripcion }) => ({
    //   value: id,
    //   label: codigo + " " + descripcion,
    // }));
    // setFormData({
    //     ...formData,
    //     documento_tipo: documentoTipo.descripcion,
    // });
    // return options;
    setDocumentoTipo(documentoTipo.descripcion);
  };

  const getDataClient = async (id) => {
    const clienteData = await getCliente(id);
    setFormData(clienteData);
    getDocumentoTipo(clienteData.id_tipo_documento);
  };

//   const getDocumentSelected = async (id) => {
//     const documentData = await getDocumentoTipo();
//     const selected = documentData.find((item) => item.value === id);
//     setSelectedDocument(selected);
//   };

//   const handleConsultaDocumento = async () => {
//     const numero = formData.documento.replace(/\s/g, ""); // quitamos espacio en blanco
//     const numeroTam = numero.length;
//     if (+numeroTam !== 8 && +numeroTam !== 11) {
//       alert("El número de documento es inválido");
//       setIsValidateDocumento(false);
//       return;
//     }
//     setIsValidateDocumento(true);
//     const apiRuta = numeroTam === 8 ? "consulta_dni.php" : "consulta_ruc.php";
//     // console.log("first")
//     const formDataPost = new FormData();
//     formDataPost.append("numero", numero);
//     const url = "https://camara-arequipa.org.pe/api/" + apiRuta;
//     fetch(url, {
//       method: "POST",
//       body: formDataPost,
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         const res = JSON.parse(data);
//         let razon = "";
//         res.direccion === undefined && "";
//         if (res.razonSocial === undefined) {
//           razon =
//             res.apellidoPaterno + " " + res.apellidoMaterno + " " + res.nombres;
//         } else {
//           razon = res.razonSocial;
//         }
//         setFormData({
//           ...formData,
//           razon_social: razon,
//           direccion_fiscal: res.direccion,
//         });
//       });
//   };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    // const numero = formData.documento.replace(/\s/g, ""); // quitamos espacio en blanco
    // const numeroTam = numero.length;
    // if (+numeroTam !== 8 && +numeroTam !== 11) {
    //   alert("El número de documento es inválido");
    //   return;
    // }
    // if (formData.id_tipo_documento === undefined) {
    //   alert("Seleccione el tipo de documento");
    //   return;
    // }
    // if (formData.id !== undefined) {
    //   const { error } = await supabase
    //     .from("clientes")
    //     .update([formData])
    //     .eq("id", formData.id);
    //   if (error) {
    //     toast.error(error.message);
    //     return;
    //   }
    //   toast.success("Cliente actualizado correctamente");
    // } else {
    //   const { error } = await supabase.from("clientes").insert([formData]);
    //   if (error) {
    //     toast.error(error.message);
    //     return;
    //   }
    //   toast.success("Cliente registrado correctamente");
    // }
    // await getClientes();
    // formRef.current.reset();
    setIsModalVer(false);
  };

  return (
    <>
      {/* <Toaster position="top-right" /> */}
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="grid grid-cols-3 mt-2 gap-x-5 gap-y-2">
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Tipo
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{documentoTipo}</span>
          </label>
          <label className="flex flex-col gap-1 col-span-2 text-sm text-zinc-500">
            Número (RUC, DNI, Etc)
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.documento}</span>
          </label>
          <label className="flex flex-col gap-1 col-span-3 text-sm text-zinc-500">
            Razón social o nombre completo
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.razon_social}</span>
          </label>
          <label className="flex flex-col gap-1 col-span-3 text-sm text-zinc-500">
            Nombre de contacto
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.contacto}</span>
          </label>
          <label className="flex flex-col gap-1 col-span-3 text-sm text-zinc-500">
            Dirección fiscal
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.direccion_fiscal}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Email principal
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.email}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            1er Email opcional
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.email_opcion_1}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            2do Email opcional
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.email_opcion_2}</span>
          </label>
        </div>
        <div className="grid grid-cols-2 mt-2 gap-x-5 gap-y-2">
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Móvil (opcional)
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.numero_movil}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Fijo (opcional)
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.numero_fijo}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            N. Cta. detracción del cliente
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.cuenta_detraccion}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Detalle adicional (opcional)
            <span className="w-full border border-zinc-300 py-2 px-3 rounded-lg">{formData.detalle_adicional}</span>
          </label>
        </div>
        <button
          type="submit"
          className="text-white mt-5 bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center w-full"
        >
          Cerrar
        </button>
      </form>
    </>
  );
};

export default ClientesView;
