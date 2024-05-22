import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/supabase/client";
import SelectInput from "@/components/SelectInput";
import { Toaster, toast } from "sonner";

const ClientesForm = ({ id, getClientes, setIsModal }) => {
  const [isValidateDocumento, setIsValidateDocumento] = useState(false);
  const [documentoTipo, setDocumentoTipo] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState([]);
  const [formData, setFormData] = useState([]);

  const formRef = useRef();

  useEffect(() => {
    getDocumentoTipo();
  }, []);

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

  const getDocumentoTipo = async () => {
    const { data: documentoTipo, error } = await supabase
      .from("cliente_tipo_de_documento")
      .select("id, codigo, descripcion")
      .order("created_at", { ascending: true });
    if (error) return console.log(error);
    const options = documentoTipo.map(({ id, codigo, descripcion }) => ({
      value: id,
      label: codigo + " " + descripcion,
    }));
    setDocumentoTipo(options);
    return options;
  };

  const getDataClient = async (id) => {
    const clienteData = await getCliente(id);
    setFormData(clienteData);
    getDocumentSelected(clienteData.id_tipo_documento);
  };

  const getDocumentSelected = async (id) => {
    const documentData = await getDocumentoTipo();
    const selected = documentData.find((item) => item.value === id);
    setSelectedDocument(selected);
  };

  const handleConsultaDocumento = async () => {
    const numero = formData.documento.replace(/\s/g, ""); // quitamos espacio en blanco
    const numeroTam = numero.length;
    if (+numeroTam !== 8 && +numeroTam !== 11) {
      alert("El número de documento es inválido");
      setIsValidateDocumento(false);
      return;
    }
    setIsValidateDocumento(true);
    const apiRuta = numeroTam === 8 ? "consulta_dni.php" : "consulta_ruc.php";
    // console.log("first")
    const formDataPost = new FormData();
    formDataPost.append("numero", numero);
    const url = "https://camara-arequipa.org.pe/api/" + apiRuta;
    fetch(url, {
      method: "POST",
      body: formDataPost,
    })
      .then((response) => response.json())
      .then((data) => {
        const res = JSON.parse(data);
        let razon = "";
        res.direccion === undefined && "";
        if (res.razonSocial === undefined) {
          razon =
            res.apellidoPaterno + " " + res.apellidoMaterno + " " + res.nombres;
        } else {
          razon = res.razonSocial;
        }
        setFormData({
          ...formData,
          razon_social: razon,
          direccion_fiscal: res.direccion,
        });
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numero = formData.documento.replace(/\s/g, ""); // quitamos espacio en blanco
    const numeroTam = numero.length;
    if (+numeroTam !== 8 && +numeroTam !== 11) {
      alert("El número de documento es inválido");
      return;
    }
    if (formData.id_tipo_documento === undefined) {
      alert("Seleccione el tipo de documento");
      return;
    }
    if (formData.id !== undefined) {
      const { error } = await supabase
        .from("clientes")
        .update([formData])
        .eq("id", formData.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Cliente actualizado correctamente");
    } else {
      const { error } = await supabase.from("clientes").insert([formData]);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Cliente registrado correctamente");
    }
    await getClientes();
    formRef.current.reset();
    setIsModal(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="grid grid-cols-3 mt-2 gap-x-5 gap-y-2">
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Tipo
            <SelectInput
              name="id_tipo_documento"
              options={documentoTipo}
              selected={selectedDocument}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  id_tipo_documento: e.value,
                });
                getDocumentSelected(e.value);
              }}
            />
          </label>
          <label className="flex flex-col gap-1 col-span-2 text-sm text-zinc-500">
            Número (RUC, DNI, Etc)
            <div className="flex items-center">
              <input
                type="text"
                name="documento"
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-tl-lg rounded-bl-lg"
                autoFocus
                required
                value={formData.documento || ""}
                onChange={(e) => {
                  setFormData({ ...formData, documento: e.target.value });
                  setIsValidateDocumento(true);
                }}
              />
              <button
                type="button"
                className="bg-primary py-2 px-3 text-white border border-primary rounded-tr-lg rounded-br-lg disabled:bg-primary/60"
                onClick={handleConsultaDocumento}
                disabled={!isValidateDocumento}
              >
                Consultar
              </button>
            </div>
          </label>
          <label className="flex flex-col gap-1 col-span-3 text-sm text-zinc-500">
            Razón social o nombre completo
            <input
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              name="razon_social"
              type="text"
              required
              value={formData.razon_social || ""}
              onChange={(e) =>
                setFormData({ ...formData, razon_social: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 col-span-3 text-sm text-zinc-500">
            Nombre de contacto
            <input
              type="text"
              name="contacto"
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.contacto || ""}
              onChange={(e) =>
                setFormData({ ...formData, contacto: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 col-span-3 text-sm text-zinc-500">
            Dirección fiscal
            <input
              type="text"
              name="direccion_fiscal"
              required
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.direccion_fiscal || ""}
              onChange={(e) =>
                setFormData({ ...formData, direccion_fiscal: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Email principal
            <input
              type="email"
              name="email"
              required
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            1er Email opcional
            <input
              type="email"
              name="email_opcion_1"
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.email_opcion_1 || ""}
              onChange={(e) =>
                setFormData({ ...formData, email_opcion_1: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            2do Email opcional
            <input
              type="email"
              name="email_opcion_2"
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.email_opcion_2 || ""}
              onChange={(e) =>
                setFormData({ ...formData, email_opcion_2: e.target.value })
              }
            />
          </label>
        </div>
        <div className="grid grid-cols-2 mt-2 gap-x-5 gap-y-2">
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Móvil (opcional)
            <input
              type="text"
              name="numero_movil"
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.numero_movil || ""}
              onChange={(e) =>
                setFormData({ ...formData, numero_movil: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Fijo (opcional)
            <input
              type="text"
              name="numero_fijo"
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.numero_fijo || ""}
              onChange={(e) =>
                setFormData({ ...formData, numero_fijo: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            N. Cta. detracción del cliente
            <input
              type="text"
              name="cuenta_detraccion"
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.cuenta_detraccion || ""}
              onChange={(e) =>
                setFormData({ ...formData, cuenta_detraccion: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Detalle adicional (opcional)
            <input
              type="text"
              name="detalle_adicional"
              className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
              value={formData.detalle_adicional || ""}
              onChange={(e) =>
                setFormData({ ...formData, detalle_adicional: e.target.value })
              }
            />
          </label>
        </div>
        <button
          type="submit"
          className="text-white mt-5 bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center w-full"
        >
          Guardar
        </button>
      </form>
    </>
  );
};

export default ClientesForm;
