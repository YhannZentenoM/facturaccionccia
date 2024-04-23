import { useState } from "react";
import * as XLSX from "xlsx";

const ButtonExport = ({ data }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    let tabla = [
      {
        A: "partner_id/id",
        B: "it_type_document/id",
        C: "serie_id/id",
        D: "date_invoice",
        E: "user_id/id",
        F: "account_id/id",
        G: "pricelist_id/id",
        H: "currency_id/id",
        I: "url_pdf",
        J: "sunat_transaction_type",
        K: "comment",
        L: "invoice_line_ids/account_id/id",
        M: "invoice_line_ids/product_id/id",
        N: "invoice_line_ids/name",
        O: "invoice_line_ids/quantity",
        P: "invoice_line_ids/uom_id/id",
        Q: "invoice_line_ids/price_unit",
        R: "invoice_line_ids/account_analytic_id/id",
        S: "invoice_line_ids/invoice_line_tax_ids/id",
      },
    ];
    data.forEach((row) => {
        for (let i = 0; i < row.detalle_productos.length; i++) {
            tabla.push({
                A: i == 0 ? row.clientes.id_odoo.trim() : "",
                B: i == 0 ? row.facturacion_tipo_documento.id_odoo.trim() : "",
                C: i == 0 ? row.facturacion_series?.id_odoo.trim() : "",
                D: i == 0 ? row.fecha_emision : "",
                E: i == 0 ? row.usuarios.id_odoo.trim() : "",
                F: i == 0 ? "l10n_pe.1_121200" : "",
                G: i == 0 ? row.clientes.id_odoo_tarifa.trim() : "",
                H: i == 0 ? row.facturacion_moneda.id_odoo.trim() : "",
                I: i == 0 ? row.url_pdf : "",
                J: i == 0 ? "VENTA INTERNA" : "",
                K: i == 0 ? "CUENTAS BANCARIAS\n\nBANCO DE CREDITO (BCP)\nCUENTA CORRIENTE: 215-00144900-80\nCCI: 002-215-000014490080-20\n\nBANCO CONTINENTAL\nCUENTA CORRIENTE: 0011-0220-0100000403-14\nCCI: 011-220-000100000403-14\n\nBANCO SCOTIABANK PERU SAC\nCUENTA CORRIENTE: 000-3228827\nCCI: 009-310-000003228827-46" : "",
                L: "l10n_pe.1_759910",
                M: row.detalle_productos[i].producto_id_odoo.trim(),
                N: row.detalle_productos[i].descripcion,
                O: row.detalle_productos[i].cantidad,
                P: "product.product_uom_unit",
                Q: row.detalle_productos[i].precio_unitario,
                R: row.detalle_productos[i].centro_costos,
                S:
                  row.detalle_productos[i].tipo_de_igv === 1
                    ? "__export__.account_tax_29"
                    : row.detalle_productos[i].tipo_de_igv === 9
                    ? "__export__.account_tax_25"
                    : "__export__.account_tax_24",
              });
        }
    });
    setTimeout(() => {
      exportToExcel(tabla);
      setLoading(false);
    }, 1000);
  };

  const exportToExcel = (tabla) => {
    setLoading(true);
    const hoja = XLSX.utils.json_to_sheet(tabla, { skipHeader: true });
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Comprobantes");
    XLSX.writeFile(libro, "comprobantes.xlsx");
    setLoading(false);
  }; 

  return (
    <button
      type="button"
      className="text-primary bg-white border-primary border hover:bg-primary/90 hover:text-white focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleDownload}
      disabled={loading || data.length === 0}
    >
      Exportar Excel
    </button>
  );
};

export default ButtonExport;
