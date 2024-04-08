import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { supabase } from "../supabase/client";
import SelectInput from "@/components/SelectInput";
import Switch from "@/components/Switch";
import Modal from "@/components/Modal";
import ClientesForm from "@/components/forms/ClientesForm";
import SelectInputBig from "@/components/SelectInputBig";
import Loading from "@/components/Loading";
import {
  IconExclamation,
  IconPdf,
  IconPlus,
  IconTimes,
} from "../components/Icons";
import { useUserAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const FACTOR_IGV = 0.15254237288;
const NUM_CUENTAS =
  "Cuenta BCP soles: 215-00144900-80<br>Cuenta BBVA soles: 0011-0220-0100000403-14<br>Cuenta SCOTIABANK soles: 000-3228827<br><br>Cuenta BCP dólares: 215-75860200-80<br>Cuenta BBVA dólares: 0011-0223-0100017574-53<br>Cuenta SCOTIABANK dólares: 01-310-106-0191-67";

const ComprobanteNuevoPage = () => {
  const { user } = useUserAuth();
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
  const igv = [{ value: 18.0, label: "18%" }];

  const [urlPdfComprobante, setUrlPdfComprobante] = useState("");
  const [comprobante, setComprobante] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalCliente, setModalCliente] = useState(false)
  const [confirmacion, setConfirmacion] = useState(false);
  const [modalErrores, setModalErrores] = useState(false);
  const [modalCredito, setModalCredito] = useState(false);
  const [errores, setErrores] = useState([]);
  const [erroresCuotas, setErroresCuotas] = useState([]);
  const [detraccionTipo, setDetraccionTipo] = useState([]);
  const [detraccionMedioPago, setDetraccionMedioPago] = useState([]);
  const [isActiveDetraccion, setIsActiveDetraccion] = useState(false);
  const [formData, setFormData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [moneda, setMoneda] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tipoIgv, setTipoIgv] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSerie, setSelectedSerie] = useState();
  const [selectedMoneda, setSelectedMoneda] = useState([]);
  const [selectedDocumento, setSelectedDocumento] = useState([]);
  const [selectedOperaciones, setSelectedOperaciones] = useState(operations[0]);
  const [filas, setFilas] = useState([]);
  const [filasCuotas, setFilasCuotas] = useState([]);
  const [totalComprobante, setTotalComprobante] = useState({
    total_descuento_global: 0.0,
    total_descuento_item: 0.0,
    total_descuento: 0.0,
    total_anticipo: 0.0,
    total_exonerada: 0.0,
    total_inafecta: 0.0,
    total_gravada: 0.0,
    total_igv: 0.0,
    total: 0.0,
  });

  useEffect(() => {
    const secuenciaNumero = async () => {
      return await getSecuenciasComprobante();
    };
    secuenciaNumero().then((secuencia) => {
      getDetraccionTipo();
      getDetraccionMedioPago();
      getClientes();
      getProductos();
      getTipoIgv();
      getTipoDocumento();
      getSeries();
      getMoneda();
      setFormData({
        ...formData,
        operacion: "generar_comprobante",
        tipo_de_comprobante: 1,
        sunat_transaction: 1,
        porcentaje_de_igv: 18.0,
        detraccion: false,
        fecha_de_emision: DateTime.now().toFormat("yyyy-MM-dd"),
        fecha_de_vencimiento: DateTime.now().toFormat("yyyy-MM-dd"),
        numero: secuencia,
        moneda: 1,
        enviar_automaticamente_a_la_sunat: true,
        enviar_automaticamente_al_cliente: true,
        total: 0.0,
        observaciones: "",
        serie: "F001",
        serie_id: 1,
        medio_de_pago: "",
      });
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

  const getTipoDocumento = async () => {
    const { data, error } = await supabase
      .from("facturacion_tipo_documento")
      .select();
    if (error) {
      console.log(error);
      return;
    }
    setSelectedDocumento(data[0]);
    setDocuments(data);
  };

  const getMoneda = async () => {
    const { data, error } = await supabase.from("facturacion_moneda").select();
    if (error) {
      console.log(error);
      return;
    }
    setSelectedMoneda(data[0]);
    setMoneda(data);
  };

  const getSeries = async () => {
    const { data, error } = await supabase.from("facturacion_series").select();
    if (error) {
      console.log(error);
      return;
    }
    const series = data.filter((item) => +item.document_type_id == 1);
    setSeries(series);
    setSelectedSerie(series[0]);
    setSeriesData(data);
  };

  const getProducto = async (id) => {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, centro_costos(nombre,referencia,id_odoo)`)
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

  const getDetraccionMedioPago = async () => {
    const { data, error } = await supabase
      .from("medio_de_pago_detraccion")
      .select("id, descripcion");
    if (error) console.log(error);
    const options = data.map((item) => {
      return {
        value: item.id,
        label: item.descripcion,
      };
    });
    setDetraccionMedioPago(options);
  };

  const filterSeriesData = async () => {
    const series = seriesData.filter(
      (item) => item.document_type_id == formData.tipo_de_comprobante
    );
    setSeries(series);
    setSelectedSerie(series[0]);
    // console.log(series[0]?.id)
    // const secuencia = await gerSecuenciasComprobante(series[0]?.id);
    series.length > 0 &&
      setFormData({
        ...formData,
        serie: series[0].value,
        serie_id: series[0].id,
        // numero: secuencia,
      });
  };

  const getSecuenciasComprobante = async (id = 1) => {
    const { data, error } = await supabase
      .from("secuencias_series")
      .select("numero")
      .eq("id_fac_series", id)
      .single();
    if (error) {
      console.log(error);
      return;
    }
    return data.numero;
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
      cliente_id: e.value,
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
    };
    setFilas([...filas, nuevaFila]);
  };

  const eliminarFila = (id) => {
    const nuevasFilas = filas.filter((fila) => fila.id !== id);
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  const agregarFilaCuotas = () => {
    const nuevaFila = {
      id: +Math.random().toString().substring(2, 10),
    };
    setFilasCuotas([...filasCuotas, nuevaFila]);
  };

  const eliminarFilaCuota = (id) => {
    const nuevasFilas = filasCuotas.filter((fila) => fila.id !== id);
    setFilasCuotas(nuevasFilas);
  };

  const handleInputChangeProductos = (id, e, name) => {
    const descripcionAdicional = e.target.value;
    const nuevasFilas = filas.map((fila) => {
      if (fila.id === id) {
        return {
          ...fila,
          [name]: descripcionAdicional,
        };
      } else {
        return fila;
      }
    });
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
              precio_unitario: +total,
              subtotal: +subtotal * +e.target.value,
              total: +total * +e.target.value,
              igv: +igv * +e.target.value,
              centro_costos: dataProducto.centro_costos.id_odoo,
              producto_id_odoo: dataProducto.id_odoo,
            };
          } else {
            if (fila.producto_id) {
              if (fila.tipo_de_igv == 1 || fila.tipo_de_igv === undefined) {
                // gravada
                const valorUnitario = decimalAdjust(+fila.valor_unitario, 2);
                const igv = decimalAdjust(valorUnitario * 0.18, 2);
                const subtotal = decimalAdjust(+valorUnitario, 2);
                const total = decimalAdjust(+subtotal + +igv, 2);
                return await {
                  ...fila,
                  [name]: +e.target.value, //cantidad
                  valor_unitario: +valorUnitario,
                  subtotal: +subtotal * +e.target.value,
                  total: +total * +e.target.value,
                  igv: +igv * +e.target.value,
                };
              }
              if (fila.tipo_de_igv == 9 || fila.tipo_de_igv == 16) {
                // inafecta
                const valorUnitario = decimalAdjust(+fila.valor_unitario, 2);
                return await {
                  ...fila,
                  [name]: +e.target.value, //cantidad
                  valor_unitario: +valorUnitario,
                  subtotal: +valorUnitario * +e.target.value,
                  total: +valorUnitario * +e.target.value,
                  igv: 0,
                };
              }
            }
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
            precio_unitario: +total,
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

  const handleImporteCuota = (id, e, name) => {
    const value = name === "importe" ? +e.target.value : e.target.value;
    const nuevasFilas = filasCuotas.map((fila) => {
      if (fila.id === id) {
        return {
          ...fila,
          [name]: value,
        };
      } else {
        return fila;
      }
    });
    setFilasCuotas(nuevasFilas);
  };

  // modificacion del tipo de IDV para cada producto
  const handleSelectChangeProductos = async (id, e, name) => {
    const nuevasFilas = await Promise.all(
      filas.map(async (fila) => {
        if (fila.id === id) {
          if (fila.producto_id) {
            if (e.value == 1) {
              const dataProducto = await getProducto(fila.producto_id);
              const igv = decimalAdjust(
                +dataProducto.precio_venta * FACTOR_IGV,
                2
              );
              const valorUnitario = decimalAdjust(
                +dataProducto.precio_venta - igv,
                2
              );
              const total = decimalAdjust(+valorUnitario + +igv, 2);
              return {
                ...fila,
                [name]: e.value,
                valor_unitario: +valorUnitario,
                precio_unitario: +total,
                subtotal: +valorUnitario * fila.cantidad,
                total: +total * fila.cantidad || 0,
                igv: +igv * fila.cantidad,
                centro_costos: dataProducto.centro_costos.id_odoo,
                producto_id_odoo: dataProducto.id_odoo,
              };
            }
            if (e.value == 9 || e.value == 16) {
              const dataProducto = await getProducto(fila.producto_id);
              const valorUnitario = decimalAdjust(
                +dataProducto.precio_venta,
                2
              );
              const total = decimalAdjust(+valorUnitario, 2);
              return {
                ...fila,
                [name]: e.value,
                valor_unitario: +valorUnitario,
                precio_unitario: +total,
                subtotal: +valorUnitario * fila.cantidad,
                total: +total * fila.cantidad || 0,
                igv: 0,
                centro_costos: dataProducto.centro_costos.id_odoo,
                producto_id_odoo: dataProducto.id_odoo,
              };
            }
          } else {
            return { ...fila, [name]: e.value };
          }
        } else {
          return fila;
        }
      })
    );
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  const handleSelectChangeProductosData = async (id, e, name) => {
    const cantidad = 1;
    const dataProducto = await getProducto(e.value);
    const igv = decimalAdjust(+dataProducto.precio_venta * FACTOR_IGV, 2);
    let valorUnitario = decimalAdjust(+dataProducto.precio_venta - igv, 2);
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
          precio_unitario: +total,
          subtotal: +valorUnitario * cantidad,
          total: +total * cantidad || 0,
          igv: +igv * cantidad,
          centro_costos: dataProducto.centro_costos.id_odoo,
          producto_id_odoo: dataProducto.id_odoo,
        };
      } else {
        return fila;
      }
    });
    setFilas(nuevasFilas);
    setFormData({ ...formData, items: nuevasFilas });
  };

  // console.log(descripcionAdicional);
  // console.log(filas);
  const sumaTotalComprobante = () => {
    const nuevaSumaTotal = filas.reduce((acc, producto) => {
      return acc + producto.total;
    }, 0);

    const tipoIgvFiltradosGravada = filas.filter((igv) => igv.tipo_de_igv == 1);
    const sumaTotalGravada = tipoIgvFiltradosGravada.reduce((acc, producto) => {
      return acc + producto.subtotal;
    }, 0);

    const tipoIgvFiltradosInafecto = filas.filter(
      (igv) => igv.tipo_de_igv == 9
    );
    const sumaTotalInafecto = tipoIgvFiltradosInafecto.reduce(
      (acc, producto) => {
        return acc + producto.subtotal;
      },
      0
    );

    const sumaTotalIgv = filas.reduce((acc, producto) => {
      return acc + producto.igv;
    }, 0);

    setTotalComprobante({
      ...totalComprobante,
      total_igv: decimalAdjust(sumaTotalIgv, 2),
      total_gravada: decimalAdjust(sumaTotalGravada, 2),
      total_inafecta: decimalAdjust(sumaTotalInafecto, 2),
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

  const getCurrentDate = (diasAnteriores) => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    // Si es el primer día del mes, retrocede al último día del mes anterior
    if (day === 1) {
      const lastDayOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      month = today.getMonth(); // Retrocede al mes anterior
      day = lastDayOfLastMonth; // Establece el último día del mes anterior
    } else {
      // Si no es el primer día del mes, simplemente retrocede un día
      day = day - diasAnteriores;
    }

    // Agregar un cero delante si el mes o el día son menores que 10
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${year}-${month}-${day}`;
  };

  const mergeDescriptions = async () => {
    const nuevasFilas = filas.map((fila) => {
      if (fila.descripcion_adicional !== undefined) {
        const filaModificada = { ...fila };
        const descripcionCompleta =
          fila.descripcion +
          "<br>" +
          fila.descripcion_adicional.replace(/\n/g, "<br>");
        filaModificada.descripcion = descripcionCompleta;
        delete filaModificada.descripcion_adicional;
        return filaModificada;
      } else {
        return fila;
      }
    });
    return nuevasFilas;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filasFinales = await mergeDescriptions();
    var formDataFinal = {
      ...formData,
      observaciones:
        formData.observaciones.replace(/\n/g, "<br>") + "<br>" + NUM_CUENTAS,
      ...totalComprobante,
      items: filasFinales,
    };

    if (filasCuotas.length > 0) {
      formDataFinal = {
        ...formDataFinal,
        medio_de_pago: "credito",
        venta_al_credito: filasCuotas,
      };
    } else {
      formDataFinal = { ...formDataFinal, medio_de_pago: "" };
      delete formDataFinal.venta_al_credito;
    }

    if (
      totalComprobante.total == 0 &&
      formDataFinal.venta_al_credito?.length > 0
    ) {
      formDataFinal = { ...formDataFinal, medio_de_pago: "" };
      delete formDataFinal.venta_al_credito;
      setFilasCuotas([]);
    }

    const arrayErrores = [];
    if (!formDataFinal.cliente_numero_de_documento)
      arrayErrores.push("El cliente no puede estar vacio");

    if (formDataFinal.items.length === 0) {
      arrayErrores.push("No se puede generar un comprobante sin items");
    } else {
      formDataFinal.items.forEach((item) => {
        if (!item.producto_id) {
          arrayErrores.push("El producto no puede estar vacio");
        }
        if (!item.cantidad) {
          arrayErrores.push("La cantidad no puede estar vacia");
        }
        if (!item.valor_unitario) {
          arrayErrores.push("El valor unitario no puede estar vacio");
        }
        if (!item.tipo_de_igv) {
          arrayErrores.push("El tipo de IGV no puede estar vacio");
        }
      });
    }

    if (formDataFinal.total > 700 && formDataFinal.detraccion === false) {
      arrayErrores.push(
        "El comprobante supera los 700 soles, debe aplicar detracción"
      );
    }

    if (
      formDataFinal.detraccion === false &&
      formDataFinal.sunat_transaction == 30
    ) {
      arrayErrores.push(
        "Debe aplicar detracción si la operación es sujeta a detracción"
      );
    }

    if (formDataFinal.detraccion === true) {
      if (formDataFinal.sunat_transaction !== 30) {
        arrayErrores.push(
          "Debe seleccionar un tipo de operación sujeta a detracción"
        );
      }
      if (!formDataFinal.detraccion_tipo) {
        arrayErrores.push("Debe seleccionar un tipo de detracción");
      }
      if (!formDataFinal.medio_de_pago_detraccion) {
        arrayErrores.push("Debe seleccionar un medio de pago de detracción");
      }
      if (!formDataFinal.detraccion_porcentaje) {
        arrayErrores.push("Debe seleccionar un porcentaje de detracción");
      }
    }

    if (arrayErrores.length > 0) {
      setErrores(arrayErrores);
      setModalErrores(true);
      return;
    }

    setConfirmacion(true);
    setFormData(formDataFinal);
  };

  const handleConfirmacion = async () => {
    setLoading(true);
    const formDataApi = new FormData();
    formDataApi.append("data", JSON.stringify(formData));

    const response = await fetch(import.meta.env.VITE_APP_NUBEFACT_URL, {
      method: "POST",
      body: formDataApi,
    });
    response.json().then(async (data) => {
      const result = JSON.parse(data);
      if (result.errors) {
        const arrayErrores = [];
        arrayErrores.push(result.errors);
        setErrores(arrayErrores);
        setModalErrores(true);
        return;
      }
      const serie = await actualizarSecuencias(
        formData.serie_id,
        +formData.numero + 1
      );
      if (!serie) {
        console.log("Error al actualizar secuencia");
        return;
      }
      const comprobante = await insertarComprobante(
        formData,
        result.enlace_del_pdf
      );
      if (!comprobante) {
        console.log("Error al insertar comprobante");
        return;
      }
      setLoading(false);
      setUrlPdfComprobante(result.enlace_del_pdf);

      setConfirmacion(false);
      setComprobante(true);
    });
  };

  const actualizarSecuencias = async (serie, secuencia) => {
    const { data, error } = await supabase
      .from("secuencias_series")
      .update({ numero: secuencia })
      .eq("id_fac_series", serie);
    if (error) {
      console.log(error);
      return;
    }
    return true;
  };

  const insertarComprobante = async (data, urlPdf) => {
    const {
      cliente_id,
      tipo_de_comprobante,
      serie_id,
      fecha_de_emision,
      moneda,
      numero,
      total,
      items,
    } = data;
    const { data: comprobante, error } = await supabase
      .from("facturas")
      .insert([
        {
          id_cliente: cliente_id,
          id_usuario: user.id,
          id_fac_tipo_documento: tipo_de_comprobante,
          id_fac_series: serie_id,
          fecha_emision: fecha_de_emision,
          id_fac_moneda: moneda,
          numero_comprobante: numero,
          total_comprobante: total,
          detalle_productos: items,
          url_pdf: urlPdf,
        },
      ]);
    if (error) {
      console.log(error);
      return;
    }
    return true;
  };

  return (
    <>
      {loading && <Loading />}
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="grid grid-cols-5 mt-2 gap-x-4 gap-y-2">
          <label className="flex flex-col col-span-2 gap-1 text-sm text-zinc-500">
            Cliente
            <div className="flex items-center">
              <SelectInputBig
                name={"cliente"}
                options={clientes}
                onChange={(e) => handleSelectCliente(e)}
              />
              <button
                type="button"
                className="bg-primary py-2 px-3 text-white border border-primary rounded-tr-lg rounded-br-lg w-[150px]"
                onClick={() => {
                  setModalCliente(true)
                }}
              >
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
              onChange={async (e) => {
                const secuencia = await getSecuenciasComprobante(e.id);
                setFormData({ ...formData, serie: e.value, numero: secuencia });
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
              min={getCurrentDate(1)}
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
              min={getCurrentDate(2)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fecha_de_vencimiento: e.target.value,
                })
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
              <label className="flex flex-col gap-1 text-sm text-zinc-500 col-span-2">
                <SelectInput
                  name={`producto_id_${fila.id}`}
                  options={productos}
                  onChange={(e) =>
                    handleSelectChangeProductosData(fila.id, e, `producto_id`)
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-500 col-span-2">
                <textarea
                  rows={1}
                  name={`descripcion_${fila.id}`}
                  className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
                  onChange={(e) =>
                    handleInputChangeProductos(
                      fila.id,
                      e,
                      `descripcion_adicional`
                    )
                  }
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
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-500">
                <input
                  type="number"
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
                {/* TODO: boton pada agregar funcionalidad de anticipo y descuentos */}
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
                value={formData.observaciones}
                onChange={(e) => {
                  setFormData({ ...formData, observaciones: e.target.value });
                }}
              ></textarea>
            </label>
            <div className="w-full flex justify-between items-center py-3">
              <Switch
                title="¿Detracción?"
                onChange={() => {
                  setIsActiveDetraccion(!isActiveDetraccion);
                  setFormData({ ...formData, detraccion: !isActiveDetraccion });
                }}
                checked={isActiveDetraccion}
              />
              <button
                type="button"
                className="text-white mt-5 bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-3 py-1 text-center disabled:opacity-50"
                disabled={totalComprobante.total == 0}
                onClick={() => setModalCredito(true)}
              >
                Medio de pago (crédito)
              </button>
            </div>
            {/* DESTRACCION */}
            {isActiveDetraccion && formData.sunat_transaction == 30 && (
              <div className="grid grid-cols-3 gap-y-2 gap-x-4">
                <label className="flex flex-col col-span-2 gap-1 text-sm text-zinc-500">
                  Tipo de detracción
                  <SelectInput
                    name={"detraccion_tipo"}
                    options={detraccionTipo}
                    onChange={(e) => {
                      setFormData({ ...formData, detraccion_tipo: +e.value });
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-zinc-500">
                  Porcentaje de detracción
                  <input
                    type="text"
                    name="detraccion_porcentaje"
                    className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg"
                    placeholder="%"
                    onChange={(e) => {
                      totalComprobante.total == 0 &&
                        setFormData({ ...formData, detraccion_total: 0 });
                      const totalDetraccion = decimalAdjust(
                        totalComprobante.total * (e.target.value / 100),
                        2
                      );
                      setFormData({
                        ...formData,
                        detraccion_porcentaje: +e.target.value,
                        detraccion_total: totalDetraccion,
                      });
                    }}
                  />
                </label>
                <label className="flex flex-col col-span-2 gap-1 text-sm text-zinc-500">
                  Medio de Pago
                  <SelectInput
                    name={"medio_de_pago_detraccion"}
                    options={detraccionMedioPago}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medio_de_pago_detraccion: +e.value,
                      })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-zinc-500">
                  Total de detracción S/
                  <input
                    type="text"
                    name="totalDetraccion"
                    className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg read-only:bg-zinc-200"
                    placeholder="S/"
                    readOnly
                    value={formData.detraccion_total || 0}
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
                value={totalComprobante.total_descuento_global}
                step={0.01}
              />
            </label>
            <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
              Descuento por Item (-)
              <input
                type="text"
                className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                value={totalComprobante.total_descuento_item}
                step={0.01}
              />
            </label>
            <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
              Descuento Total (-)
              <input
                type="text"
                className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                value={totalComprobante.total_descuento}
                step={0.01}
              />
            </label>
            <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
              Anticipo (-)
              <input
                type="text"
                className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                value={totalComprobante.total_anticipo}
                step={0.01}
              />
            </label>
            <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
              Exonerada
              <input
                type="text"
                className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                value={totalComprobante.total_exonerada}
                step={0.01}
              />
            </label>
            <label className="flex items-center justify-end gap-3 text-sm text-zinc-500">
              Inafecta
              <input
                type="text"
                className="py-1 px-2 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-[100px] lg:w-[150px] text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                value={totalComprobante.total_inafecta}
                step={0.01}
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
      {/* ERRORES */}
      <Modal isOpen={modalErrores} onClose={() => setModalErrores(false)}>
        <h3 className="font-normal">Advertencia!!</h3>
        <ul className="font-normal text-sm mt-3 text-zinc-900">
          {errores.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            className="text-white bg-secondary border hover:bg-secondary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-1 text-center"
            onClick={() => {
              setModalErrores(false);
              setLoading(false);
            }}
          >
            Cerrar
          </button>
        </div>
      </Modal>
      {/* CREDITO */}
      <Modal
        isOpen={modalCredito}
        onClose={() => setModalCredito(false)}
        title="Ingreso de cuotas"
      >
        {erroresCuotas.length > 0 && (
          <div className="bg-red-200 p-2 text-xs text-red-600 border border-red-300 rounded-md mt-2">
            {erroresCuotas.join(" | ")}
          </div>
        )}
        {filasCuotas.map((cuota, index) => (
          <div className="flex flex-row gap-5 w-full mt-4" key={cuota.id}>
            <label className="flex flex-col gap-1 text-sm text-zinc-500">
              Cuota
              <input
                type="text"
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg read-only:bg-zinc-200"
                readOnly
                placeholder="Número de cuota correlativo"
                value={index + 1}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500 w-full">
              Importe
              <input
                type="number"
                name="importe"
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg read-only:bg-zinc-200"
                placeholder="Ejemplo: 100.00"
                step={0.01}
                onChange={(e) => handleImporteCuota(cuota.id, e, `importe`)}
                value={cuota.importe || ""}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-500 w-full">
              Fecha de Cuota
              <input
                type="date"
                name="fecha_de_pago"
                className="py-2 px-3 focus:outline-none focus:ring-0 focus:border-zinc-400 border border-zinc-300 w-full text-zinc-900 rounded-lg read-only:bg-zinc-200"
                onChange={(e) =>
                  handleImporteCuota(cuota.id, e, `fecha_de_pago`)
                }
                value={cuota.fecha_de_pago || ""}
              />
            </label>
            <div className="flex items-end justify-end">
              <button
                type="button"
                className="text-xs text-white bg-red-500/80 p-1 hover:bg-red-500 hover:underline"
                onClick={() => eliminarFilaCuota(cuota.id)}
              >
                <IconTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        <div className="w-full p-2 flex items-start">
          <button
            type="button"
            className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-normal rounded-xl text-sm px-3 py-1 text-center"
            onClick={() => agregarFilaCuotas()}
          >
            Agregar cuota
          </button>
        </div>
        <div className="w-full p-2 flex justify-end">
          <button
            type="submit"
            className="text-white mt-3 bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-2 text-center"
            onClick={() => {
              const arrayErroresCuotas = [];
              const sumaTotalCuotas = filasCuotas.reduce(
                (acc, importeCuota) => {
                  return acc + importeCuota.importe;
                },
                0
              );
              if (sumaTotalCuotas > totalComprobante.total) {
                arrayErroresCuotas.push(
                  "La suma de las cuotas no puede ser mayor al total del comprobante"
                );
              }
              filasCuotas.map((cuota) => {
                if (
                  new Date(cuota.fecha_de_pago) <=
                  new Date(formData.fecha_de_emision)
                ) {
                  arrayErroresCuotas.push(
                    "La fecha de cuota no puede ser menor a la fecha de emisión"
                  );
                }
                if (!cuota.importe) {
                  arrayErroresCuotas.push("El importe no puede estar vacio");
                }
                if (!cuota.fecha_de_pago) {
                  arrayErroresCuotas.push(
                    "La fecha de pago no puede estar vacia"
                  );
                }
                if (cuota.importe <= 0) {
                  arrayErroresCuotas.push(
                    "El importe no puede ser menor o igual a 0"
                  );
                }
                if (cuota.fecha_de_pago <= getCurrentDate(1)) {
                  arrayErroresCuotas.push(
                    "La fecha de cuota no puede ser menor a la fecha actual"
                  );
                }
              });
              if (arrayErroresCuotas.length > 0) {
                setErroresCuotas(arrayErroresCuotas);
                return;
              }
              const nuevasFilasCuptas = filasCuotas.map((numCuota, index) => {
                return {
                  ...numCuota,
                  cuota: +index + 1,
                };
              });
              setFilasCuotas(nuevasFilasCuptas);
              setErroresCuotas([]);
              setModalCredito(false);
            }}
          >
            Aceptar
          </button>
        </div>
      </Modal>
      {/* CONFIRMACION */}
      <Modal
        isOpen={confirmacion}
        onClose={() => setConfirmacion(false)}
        title="Confirmación"
      >
        <div className="flex flex-col justify-center items-center w-full p-6 gap-5">
          <IconExclamation className="w-20 text-warning" />
          <h3 className="font-light text-2xl">
            ¿Está seguro de validar el comprobante?
          </h3>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            className="text-white bg-secondary border hover:bg-secondary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-1 text-center"
            onClick={() => setConfirmacion(false)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-1 text-center"
            onClick={async () => {
              setConfirmacion(false);
              await handleConfirmacion();
            }}
          >
            Aceptar
          </button>
        </div>
      </Modal>
      {/* COMPROBANTES */}
      <Modal
        isOpen={comprobante}
        onClose={() => {
          setComprobante(false);
          window.location.reload();
        }}
        title="Descargar comprobante"
      >
        <div className="flex flex-col justify-center items-center w-full p-6 gap-5">
          <IconPdf className="w-20 text-danger/50" />
          <h3 className="font-light text-2xl">
            Comprobante generado correctamente
          </h3>
          <Link
            to={urlPdfComprobante}
            target="_blank"
            className="bg-success/70 px-6 py-2 text-white rounded-xl text-lg font-medium hover:scale-105 hover:bg-success transition-all duration-300"
          >
            Descargar comprobante
          </Link>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="submit"
            className="text-white bg-primary border hover:bg-primary/90 focus:outline-none font-medium rounded-xl text-sm px-5 py-1 text-center"
            onClick={async () => {
              setComprobante(false);
              window.location.reload();
            }}
          >
            Aceptar
          </button>
        </div>
      </Modal>
      <Modal isOpen={modalCliente} onClose={() => setModalCliente(false)}>
          <h1 className="text-3xl">Nuevo cliente</h1>
          <ClientesForm id={null} getClientes={getClientes} setIsModal={setModalCliente} />
      </Modal>
    </>
  );
};

export default ComprobanteNuevoPage;
