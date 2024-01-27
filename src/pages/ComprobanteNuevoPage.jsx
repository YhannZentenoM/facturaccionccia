import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { supabase } from "../supabase/client";
import SelectInput from "../components/SelectInput";
import Switch from "../components/Switch";
import { IconPlus, IconTimes } from "../components/Icons";
// import { data } from 'autoprefixer';
const FACTOR_IGV = 0.15254237288;

const ComprobanteNuevoPage = () => {
  const documents = [
    { value: 1, label: "FACTURA [01]" },
    { value: 2, label: "BOLETA [02]" },
    { value: 3, label: "NOTA DE CRÉDITO [03]" },
    { value: 4, label: "NOTA DE DÉBITO [04]" },
  ];
  const operations = [
    { value: 1, label: "VENTA INTERNA [01]" },
    {
      value: 4,
      label: "ANTICIPO O DEDUCCIÓN DE ANTICIPO EN VENTA INTERNA [04]",
    },
    { value: 2, label: "EXPORTACIÓN [02]" },
    {
      value: 29,
      label: "VENTAS NO DOMICILIADOS QUE NO CALIFICAN COMO EXPORTACION [0401]",
    },
    { value: 30, label: "OPERACIÓN SUJETA A DETRACCIÓN [1001]" },
    {
      value: 33,
      label:
        "OPERACIÓN SUJETA A DETRACCIÓN - SERVICIOS DE TRANSPORTE CARGA [1004]",
    },
    { value: 34, label: "OPERACIÓN SUJETA A PERCEPCIÓN [2001]" },
    {
      value: 32,
      label:
        "OPERACIÓN SUJETA A DETRACCIÓN - SERVICIOS DE TRANSPORTE PASAJEROS [1003]",
    },
    {
      value: 31,
      label: "OPERACIÓN SUJETA A DETRACCIÓN - RECURSOS HIDROBIOLÓGICOS [1002]",
    },
  ];
  const seriesData = [
    { value: "F001", label: "F001", document_type_id: 1 },
    { value: "F002", label: "F002", document_type_id: 1 },
    { value: "F003", label: "F003", document_type_id: 1 },
    { value: "F004", label: "F004", document_type_id: 1 },
    { value: "B001`", label: "B001", document_type_id: 2 },
    { value: "B002", label: "B002", document_type_id: 2 },
    { value: "B003", label: "B003", document_type_id: 2 },
    { value: "B004", label: "B004", document_type_id: 2 },
    { value: "F001", label: "F001", document_type_id: 3 },
    { value: "F002", label: "F002", document_type_id: 3 },
    { value: "F003", label: "F003", document_type_id: 3 },
    { value: "F004", label: "F004", document_type_id: 3 },
    { value: "F001", label: "F001", document_type_id: 4 },
    { value: "F002", label: "F002", document_type_id: 4 },
    { value: "F003", label: "F003", document_type_id: 4 },
    { value: "F004", label: "F004", document_type_id: 4 },
  ];
  const igv = [
    { value: 18.0, label: "18%" },
    // { value: 10.00, label: '10%' },
    // { value: 4.00, label: '4%' },
  ];
  const moneda = [
    { value: 1, label: "S/" },
    { value: 2, label: "$" },
    { value: 3, label: "€" },
    { value: 4, label: "£" },
  ];

  const [detraccionTipo, setDetraccionTipo] = useState([]);
  const [isActiveDetraccion, setIsActiveDetraccion] = useState(false);
  const [formData, setFormData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tipoIgv, setTipoIgv] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSerie, setSelectedSerie] = useState();
  const [selectedMoneda, setSelectedMoneda] = useState(moneda[0]);
  const [selectedDocumento, setSelectedDocumento] = useState(documents[0]);
  const [selectedOperaciones, setSelectedOperaciones] = useState(operations[0]);
  const [filas, setFilas] = useState([]);
  const [totalComprobante, setTotalComprobante] = useState({
    total_gravada: 0.0,
    total_igv: 0.0,
    total: 0.0,
  });
  // const [valoresFinales, setValoresFinales] = useState([]);
  // console.log(formData)

  useEffect(() => {
    getDetraccionTipo();
    getClientes();
    getProductos();
    getTipoIgv();
    setFormData({
      ...formData,
      operacion: "generar_comprobante",
      tipo_de_comprobante: 1,
      sunat_transaction: 1,
      porcentaje_de_igv: 18.0,
      detraccion: false,
      fecha_de_emision: DateTime.now().toFormat("yyyy-MM-dd"),
      fecha_de_vencimiento: DateTime.now().toFormat("yyyy-MM-dd"),
      numero: 1,
    });
  }, []);

  useEffect(() => {
    sumaTotalComprobante();
  }, [filas]);

  useEffect(() => {
    filterSeriesData();
  }, [formData.tipo_de_comprobante]);

  const getClientes = async () => {
    const { data, error } = await supabase.from("clientes").select();
    if (error) console.log(error);
    const options = data.map((item) => {
      return {
        value: item.id,
        label: `${item.documento} - ${item.razon_social}`,
      };
    });
    setClientes(options);
  };

  const getProductos = async () => {
    const { data, error } = await supabase.from("productos").select();
    if (error) console.log(error);
    const options = data.map((item) => {
      return {
        value: item.id,
        label: `${item.codigo} - ${item.nombre}`,
      };
    });
    setProductos(options);
  };

  const getProducto = async (id) => {
    const { data, error } = await supabase
      .from("productos")
      .select()
      .eq("id", id)
      .single();
    if (error) console.log(error);
    return data;
  };

  const getTipoIgv = async () => {
    const { data, error } = await supabase.from("tipo_igv").select();
    if (error) console.log(error);
    const options = data.map((item) => {
      return {
        value: item.codigo,
        label: `${item.descripcion}`,
      };
    });
    setTipoIgv(options);
  };

  const getDetraccionTipo = async () => {
    const { data, error } = await supabase
      .from("detraccion_tipo")
      .select("codigo, nombre");
    if (error) console.log(error);
    const options = data.map((item) => {
      return {
        value: item.codigo,
        label: item.nombre,
      };
    });
    setDetraccionTipo(options);
  };

  const filterSeriesData = () => {
    const series = seriesData.filter(
      (item) => item.document_type_id == formData.tipo_de_comprobante
    );
    setSeries(series);
    setSelectedSerie(series[0]);
    series.length > 0 && setFormData({ ...formData, serie: series[0].value });
  };

  const handleSelectCliente = async (e) => {
    // console.log("CLIENTE", e.value)
    const { data, error } = await supabase
      .from("clientes")
      .select(
        `
            *,
            cliente_tipo_de_documento(
                codigo
            )
        `
      )
      .eq("id", e.value)
      .single();
    if (error) console.log(error);
    // console.log("DATA", data)
    setFormData({
      ...formData,
      cliente_tipo_de_documento: +data.cliente_tipo_de_documento.codigo,
      cliente_numero_de_documento: data.documento,
      cliente_denominacion: data.razon_social,
      cliente_direccion: data.direccion_fiscal,
      cliente_email: data.email || "",
      cliente_email_1: data.email_opcion_1 || "",
      cliente_email_2: data.email_opcion_2 || "",
    });
  };

  const agregarFilaProductos = () => {
    const nuevaFila = {
      id: +Math.random().toString().substring(2, 10),
      cantidad: 1,
      valor_unitario: 0.0,
      total: 0.0,
      igv: 0.0,
      subtotal: 0.0,
      tipo_de_igv: tipoIgv[0].value,
    };
    setFilas([...filas, nuevaFila]);
  };

  const eliminarFila = (id) => {
    const nuevasFilas = filas.filter((fila) => fila.id !== id);
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  const handleInputChangeProductos = (id, e, name) => {
    const nuevasFilas = filas.map((fila) =>
      fila.id === id
        ? {
            ...fila,
            [name]: e.target.value,
          }
        : fila
    );
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  const handleInputNumberChangeProductos = async (id, e, name) => {
    const nuevasFilas = await Promise.all(
      filas.map(async (fila) => {
        if (fila.id === id) {
          if (fila.valor_unitario === 0) {
            const dataProducto = await getProducto(fila.producto_id);
            const igv = decimalAdjust(
              +dataProducto.precio_venta * FACTOR_IGV,
              2
            );
            console.log("first", igv);
            const valorUnitario = decimalAdjust(
              +dataProducto.precio_venta - igv,
              2
            );
            const subtotal = decimalAdjust(+valorUnitario, 2);
            const total = decimalAdjust(+subtotal + +igv, 2);
            return await {
              ...fila,
              [name]: +e.target.value, //cantidad
              valor_unitario: +valorUnitario,
              precio_unitario: +dataProducto.precio_venta,
              subtotal: +subtotal * +e.target.value,
              total: +total * +e.target.value,
              igv: +igv * +e.target.value,
            };
          } else {
            const valorUnitario = decimalAdjust(+fila.valor_unitario, 2);
            const igv = decimalAdjust(valorUnitario * 0.18, 2);
            const subtotal = decimalAdjust(+valorUnitario, 2);
            const total = decimalAdjust(+subtotal + +igv, 2);
            return await {
              ...fila,
              [name]: +e.target.value, //cantidad
              valor_unitario: +valorUnitario,
              // precio_unitario: +dataProducto.precio_venta,
              subtotal: +subtotal * +e.target.value,
              total: +total * +e.target.value,
              igv: +igv * +e.target.value,
            };
          }
        } else {
          return fila;
        }
      })
    );
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  const handlePriceChangeProductos = async (id, e, name) => {
    const nuevasFilas = await Promise.all(
      filas.map(async (fila) => {
        if (fila.id === id) {
          const valorUnitario = decimalAdjust(+e.target.value, 2);
          const igv = decimalAdjust(valorUnitario * 0.18, 2);
          const subtotal = decimalAdjust(+valorUnitario, 2);
          const total = decimalAdjust(+subtotal + +igv, 2);
          return await {
            ...fila,
            [name]: valorUnitario, //precio_unitario
            precio_unitario: valorUnitario,
            subtotal: +subtotal * +fila.cantidad,
            total: +total * +fila.cantidad || 0,
            igv: +igv * +fila.cantidad,
          };
        } else {
          return fila;
        }
      })
    );
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  const handleSelectChangeProductos = (id, e, name) => {
    const nuevasFilas = filas.map((fila) => {
      if (fila.id === id) {
        return { ...fila, [name]: e.value };
      } else {
        return fila;
      }
    });
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  const handleSelectChangeProductosData = async (id, e, name) => {
    const cantidad = 1;
    const dataProducto = await getProducto(e.value);
    const igv = decimalAdjust(+dataProducto.precio_venta * FACTOR_IGV, 2);
    const valorUnitario = decimalAdjust(+dataProducto.precio_venta - igv, 2);
    const total = decimalAdjust(+valorUnitario + +igv, 2);

    const nuevasFilas = filas.map((fila) => {
      if (fila.id === id) {
        return {
          ...fila,
          [name]: e.value,
          cantidad: cantidad,
          unidad_de_medida: "ZZ",
          descripcion: dataProducto.nombre,
          valor_unitario: +valorUnitario,
          precio_unitario: +dataProducto.precio_venta,
          subtotal: +valorUnitario * cantidad,
          total: +total * cantidad || 0,
          igv: +igv * cantidad,
          tipo_de_igv: tipoIgv[0].value,
        };
      } else {
        return fila;
      }
    });
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  console.log(filas);
  const sumaTotalComprobante = () => {
    const nuevaSumaTotal = filas.reduce((acc, producto) => {
      return acc + producto.total;
    }, 0);

    const sumaTotalGravada = filas.reduce((acc, producto) => {
      return acc + producto.subtotal;
    }, 0);

    const sumaTotalIgv = filas.reduce((acc, producto) => {
      return acc + producto.igv;
    }, 0);
    setTotalComprobante({
      ...totalComprobante,
      total_igv: decimalAdjust(sumaTotalIgv, 2),
      total_gravada: decimalAdjust(sumaTotalGravada, 2),
      total: decimalAdjust(nuevaSumaTotal, 2),
    });
  };

  function decimalAdjust(number, decimals) {
    if (isNaN(number) || isNaN(decimals)) {
      return "Invalid input";
    }
    const roundedNumber = Number(number).toFixed(decimals);
    return Number(roundedNumber);
  }

  return (
    <form>
      <div className="grid grid-cols-5 mt-2 gap-x-4 gap-y-2">
        <label className="flex flex-col col-span-2 gap-1 text-sm text-zinc-500">
          Cliente
          <div className="flex items-center">
            <SelectInput
              name={"cliente"}
              options={clientes}
              onChange={(e) => handleSelectCliente(e)}
              // selected={clientes[0]}
            />
            <button className="bg-primary py-2 px-3 text-white border border-primary rounded-tr-lg rounded-br-lg w-[150px]">
              Nuevo cliente
            </button>
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Tipo de documento
          <SelectInput
            name={"tipoDocumento"}
            required={true}
            options={documents}
            onChange={(e) => {
              setFormData({ ...formData, tipo_de_comprobante: e.value });
              setSelectedDocumento(e);
            }}
            selected={selectedDocumento}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Serie
          <SelectInput
            name={"serie"}
            options={series}
            onChange={(e) => {
              setFormData({ ...formData, serie: e.value });
              setSelectedSerie(e);
            }}
            selected={selectedSerie}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Número
          <input
            type="text"
            name="numero"
            className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg read-only:bg-zinc-200"
            readOnly
            onChange={(e) =>
              setFormData({ ...formData, numero: +e.target.value })
            }
            value={formData.numero || ""}
          />
        </label>
      </div>
      <div className="grid grid-cols-6 mt-2 gap-x-4 gap-y-2">
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Tipo de operación
          <SelectInput
            name={"tipoOperacion"}
            options={operations}
            onChange={(e) => {
              setFormData({ ...formData, sunat_transaction: e.value });
              setSelectedOperaciones(e);
            }}
            selected={selectedOperaciones}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Fecha emisión
          <input
            type="date"
            name="fechaEmision"
            className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, fecha_de_emision: e.target.value })
            }
            value={formData.fecha_de_emision || ""}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Fecha vencimiento
          <input
            type="date"
            name="fechaVencimiento"
            className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, fecha_de_vencimiento: e.target.value })
            }
            value={formData.fecha_de_vencimiento || ""}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          IGV %
          <SelectInput
            name={"igv"}
            options={igv}
            onChange={(e) => {
              setFormData({ ...formData, porcentaje_de_igv: e.value });
            }}
            selected={igv[0]}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Moneda
          <SelectInput
            name={"moneda"}
            options={moneda}
            onChange={(e) => {
              setFormData({ ...formData, moneda: e.value });
              setSelectedMoneda(e);
            }}
            selected={selectedMoneda}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-500">
          Tipo de cambio
          <input
            type="text"
            name="cambio"
            className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
          />
        </label>
      </div>
      <div className="w-full mt-2">
        <div className="grid grid-cols-10 gap-1">
          <label className="flex flex-col gap-1 text-sm text-zinc-500 col-span-2">
            Producto - Servicio
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500 col-span-2">
            Detalle adicional
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Cantidad
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Tipo IGV
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Valor Unit.
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Subtotal
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Total
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Acciones
          </label>
        </div>
        {filas.map((fila) => (
          <div key={fila.id} className="grid grid-cols-10 gap-1">
            {console.log("IGVFILA", fila.tipo_de_igv)}
            <label className="flex flex-col gap-1 text-sm text-zinc-500 col-span-2">
              <SelectInput
                name={`producto_id_${fila.id}`}
                options={productos}
                // onChange={(e) => { setFormData({ ...formData, moneda: e.value }); setSelectedMoneda(e) }}
                onChange={(e) =>
                  handleSelectChangeProductosData(fila.id, e, `producto_id`)
                }
                // selected={selectedMoneda}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500 col-span-2">
              <input
                type="text"
                name={`detalle_${fila.id}`}
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
                onChange={(e) =>
                  handleInputChangeProductos(fila.id, e, `detalle`)
                }
                // value={fila.detalle_+`${fila.id}` || ''}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500">
              <input
                type="number"
                min={1}
                name={`cantidad_${fila.id}`}
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
                onChange={(e) =>
                  handleInputNumberChangeProductos(fila.id, e, `cantidad`)
                }
                defaultValue={1}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500">
              <SelectInput
                name={`tipo_de_igv_${fila.id}`}
                options={tipoIgv}
                onChange={(e) => {
                  handleSelectChangeProductos(fila.id, e, `tipo_de_igv`);
                }}
                // value={fila.tipo_de_igv}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500">
              <input
                type="number"
                min={1}
                name={`valor_unitario_${fila.id}`}
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
                onChange={(e) =>
                  handlePriceChangeProductos(fila.id, e, `valor_unitario`)
                }
                value={fila.valor_unitario || ""}
                step={0.01}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500">
              <input
                type="number"
                name="cambio"
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                // defaultValue={0.00}
                step={0.01}
                value={fila.subtotal || ""}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500">
              <input
                type="text"
                name="cambio"
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                // defaultValue={0.00}
                step={0.01}
                value={fila.total || ""}
              />
            </label>
            <div className="flex items-center justify-center">
              {selectedOperaciones.value === 4 && (
                <button className="bg-primary p-1 text-white">
                  <IconPlus className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                className="text-xs text-white bg-red-500/80 p-1 hover:bg-red-500 hover:underline"
                onClick={() => eliminarFila(fila.id)}
              >
                <IconTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full p-2 flex items-center">
        <button
          type="button"
          className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-normal rounded-xl text-sm px-3 py-1 text-center"
          onClick={() => agregarFilaProductos()}
        >
          Agregar item
        </button>
      </div>
      <div className="grid grid-cols-3 mt-2 gap-x-4 gap-y-2">
        <div className="col-span-2">
          <label className="flex flex-col gap-1 text-sm text-zinc-500">
            Observaciones
            <textarea
              name="observaciones"
              rows="3"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
            ></textarea>
          </label>
          <div className="w-full py-3">
            <Switch
              title="¿Detracción?"
              onChange={() => {
                setIsActiveDetraccion(!isActiveDetraccion);
                setFormData({ ...formData, detraccion: !isActiveDetraccion });
              }}
              checked={isActiveDetraccion}
            />
          </div>
          {isActiveDetraccion && formData.sunat_transaction == 30 && (
            <div className="grid grid-cols-3 gap-y-2 gap-x-4">
              <label className="flex flex-col col-span-2 gap-1 text-sm text-zinc-500">
                Tipo de detracción
                <SelectInput
                  name={"detraccionTipo"}
                  options={detraccionTipo}
                  onChange={(e) => console.log(e)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-500">
                Porcentaje de detracción
                <input
                  type="text"
                  name="porcentajeDetraccion"
                  className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
                  placeholder="%"
                />
              </label>
              <label className="flex flex-col col-span-2 gap-1 text-sm text-zinc-500">
                Medio de Pago
                <SelectInput
                  name={"moneda"}
                  options={moneda}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_operacion: e.value })
                  }
                  // selected={formData.tipo_operacion[0]}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-500">
                Total de detracción S/
                <input
                  type="text"
                  name="totalDetraccion"
                  className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
                  placeholder="S/"
                />
              </label>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            % Descuento Global
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg"
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Descuento Global (-)
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Descuento por Item (-)
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Descuento Total (-)
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Anticipo (-)
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Exonerada
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Inafecta
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Gravada
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
              value={totalComprobante.total_gravada}
              step={0.01}
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            IGV
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
              value={totalComprobante.total_igv}
              step={0.01}
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Gratuita
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Otros Cargos
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg"
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            ICBPER
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
            />
          </label>
          <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
            Total
            <input
              type="text"
              className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
              readOnly
              value={totalComprobante.total}
              step={0.01}
            />
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="text-white mt-5 bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-3 text-center w-full"
      >
        Guardar
      </button>
    </form>
  );
};

export default ComprobanteNuevoPage;
