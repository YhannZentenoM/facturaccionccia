import React from "react";
import XLSX from "xlsx";
import { Toaster, toast } from "sonner";
import { supabase } from "@/supabase/client";

const ActualizarClientesForm = ({ setIsModal }) => {
  const handleLoadClients = async (e) => {
    e.preventDefault();
    const file = e.target.client_data_odoo.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const clients = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const formattedClients = clients
        .slice(1)
        .map((row) => ({
          id: row[0],
          documento: row[1],
        }))
        .filter((client) => client.documento && client.documento.trim() !== "");
      compareAndUpdateClients(formattedClients);
    };
    reader.readAsArrayBuffer(file);
  };

  const compareAndUpdateClients = async (clients) => {
    const { data: clientsFromDB, error } = await supabase
      .from("clientes")
      .select("id, documento");
    if (error) {
      console.error(error);
      return;
    }
    const clientsToUpdate = clients.filter((client) =>
      clientsFromDB.some(
        (clientFromDB) => client.documento === clientFromDB.documento
      )
    );
    if (clientsToUpdate.length == 0) {
      toast.error("No se encontraron clientes para actualizar");
      return;
    }
    clientsToUpdate.forEach(async (client) => {
      const { error } = await supabase
        .from("clientes")
        .update({ id_odoo: client.id })
        .eq("documento", client.documento);
      if (error) {
        toast.error(error.message);
        return;
      }
    });
    setIsModal(false);
    toast.success("Clientes actualizados correctamente");
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleLoadClients}>
        <div className="flex items-center gap-x-2">
          <label className="flex flex-col gap-1 col-span-3 text-sm text-zinc-500 w-full">
            Subir archivo
            <input
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50  focus:outline-none py-2 px-3"
              name="client_data_odoo"
              type="file"
            />
          </label>
          <button
            type="submit"
            className="text-white mt-5 bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center max-w-sml"
          >
            Cargar
          </button>
        </div>
      </form>
    </>
  );
};

export default ActualizarClientesForm;
