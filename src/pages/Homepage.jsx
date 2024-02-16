// TODO: arreglar la direccion automatica  a la pagina de comprobantes
// TODO: arreglar login validaciones
import { DateTime } from "luxon";
import Layout from "../components/Layout";
import Table from "../components/Table";
import { Link } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useEffect, useState } from "react";
import ButtonExport from "../components/ButtonExport";
import { IconPdf } from "../components/Icons";

const Homepage = () => {
  const [comprobantes, setComprobantes] = useState([]);
  const [series, setSeries] = useState([]);
  const [filtroSeries, setFiltroSeries] = useState(1);
  const [filtroFecha, setFiltroFecha] = useState(
    DateTime.now().toFormat("yyyy-MM-dd")
  );

  useEffect(() => {
    getSeries();
    getComprobantes(filtroFecha, filtroSeries);
  }, []);

  const getComprobantes = async (fecha, serie) => {
    const { data, error } = await supabase
      .from("facturas")
      .select(
        `
    fecha_emision,
    numero_comprobante,
    total_comprobante,
    url_pdf,
    detalle_productos,
    facturacion_moneda(label,id_odoo),
    facturacion_series(value, id_odoo),
    clientes(documento,razon_social,id_odoo,id_odoo_tarifa),
    facturacion_tipo_documento(id_odoo),
    usuarios(id_odoo)
    `
      )
      .eq("fecha_emision", fecha)
      .eq("id_fac_series", serie);
    if (error) {
      console.error(error);
      return;
    }
    // console.log(data)
    setComprobantes(data);
  };

  const getSeries = async () => {
    const { data, error } = await supabase
      .from("facturacion_series")
      .select(`id, value, facturacion_tipo_documento(label)`);
    if (error) {
      console.error(error);
      return;
    }
    setSeries(data);
  };

  const columns = [
    {
      header: "Fecha",
      accessorKey: "fecha_emision",
    },
    {
      header: "Serie",
      accessorFn: (row) => `${row.facturacion_series?.value}`,
    },
    {
      header: "Num.",
      accessorFn: (row) => `${row.numero_comprobante}`,
    },
    {
      header: "Ruc, DNI",
      accessorFn: (row) => `${row.clientes.documento}`,
    },
    {
      header: "Denominación",
      accessorFn: (row) => `${row.clientes.razon_social}`,
    },
    {
      header: "Moneda",
      accessorFn: (row) => `${row.facturacion_moneda.label}`,
    },
    {
      header: "Total",
      accessorFn: (row) => `${row.total_comprobante}`,
    },
    {
      header: "PDF",
      cell: ({ cell }) => {
        const url = cell.row.original?.url_pdf;
        return (
          <div className="flex items-center gap-2">
            <a
              href={`${url}`}
              target="_blank"
              rel="noreferrer"
              className={`${
                url === null
                  ? "pointer-events-none bg-primary/40"
                  : "bg-primary"
              } text-white rounded-sm`}
            >
              <IconPdf className="w-5" />
            </a>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="py-5 flex flex-col gap-2">
        <h1 className="text-3xl font-light mb-3">Comprobantes Electrónicos</h1>
        <Table data={comprobantes} columns={columns}>
          <div className="flex items-center gap-5">
            <Link
              to="/comprobantes/nuevo"
              className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center transition-colors duration-200"
            >
              Emitir nuevo comprobante
            </Link>
            <ButtonExport data={comprobantes} />
            <input
              type="date"
              className="text-primary border border-primary focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center transition-colors duration-200"
              value={filtroFecha}
              onChange={async (e) => {
                setFiltroFecha(e.target.value);
                await getComprobantes(e.target.value, filtroSeries);
              }}
            />
            <select
              className="text-primary border border-primary focus:outline-none font-medium rounded-xl text-sm p-2 text-center transition-colors duration-200"
              value={filtroSeries}
              onChange={async (e) => {
                setFiltroSeries(e.target.value);
                await getComprobantes(filtroFecha, e.target.value);
              }}
            >
              {series.map((serie) => (
                <option key={serie.id} value={serie.id}>
                  {serie.value} - {serie.facturacion_tipo_documento.label}
                </option>
              ))}
            </select>
          </div>
        </Table>
      </div>
    </Layout>
  );
};

export default Homepage;
