import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import db from "../../firebase";

export default function AddVenta() {
  const [articulos, setArticulos] = useState([]);
  const [item, setItem] = useState({ id: "", precioVentaArticulo: "", cantidadVendidaArticulo: "" });

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "Articulo"));
      const data = snap.docs
        .map((d) => ({
          id: d.id,
          nombre: d.data().nombreArticulo,
          stock: d.data().stockActualArticulo,
          demanda: d.data().demandaArticulo,
          baja: d.data().fechahorabaja || null,
        }))
        .filter((a) => !a.baja);

      setArticulos(data);
    };
    fetchData();
  }, []);

  // Chequea si hay OC activas (Pendiente o Enviada) para ese artículo
  const verificarOrdenActiva = async (articuloId) => {
    const ocSnap = await getDocs(collection(db, "OrdenCompra"));
    for (const oc of ocSnap.docs) {
      // Buscar estado activo
      const estados = await getDocs(
        collection(db, "OrdenCompra", oc.id, "EstadoOrdenCompra")
      );
      const activo = estados.docs.find(
        (e) => e.data().fechaHoraBajaEstadoCompra === null
      );
      const estado = activo?.data()?.nombreEstadoCompra;
      if (["Pendiente", "Enviada"].includes(estado)) {
        // Verificar si la OC es para el artículo buscado
        const data = oc.data();
        console.log("Datos de la OC:", data);
        console.log("Comparando con artículo ID:", articuloId);
        if (data.codArticulo === articuloId) {
          return true;
        }
      }
    }
    return false;
  };

  // Si corresponde, autogenera OC para ese artículo (sin detalle)
  const verificarYGenerarOC = async (nuevoArticulo, stockFinal) => {
    const modeloSnap = await getDocs(
      query(collection(db, "ModeloInventario"), where("articuloId", "==", nuevoArticulo.id))
    );
    console.log("ModeloInventario encontrado:", modeloSnap.docs.length);
    if (modeloSnap.empty){
      console.log("No se encontró ModeloInventario para el artículo:", nuevoArticulo.id);
      return };

    const modelo = modeloSnap.docs[0].data();
    console.log("Datos del modelo:", modelo);
    const modeloNombre = modelo.tipoModeloId;
    console.log("Nombre del modelo:", modeloNombre);
    const puntoPedido = modelo.puntoPedido ?? 0;
    console.log("Punto de pedido:", puntoPedido);
    const loteOptimo = modelo.cantiadAPedirOptima ?? 1;
    console.log("Lote óptimo:", loteOptimo);
    console.log("Stock final:", stockFinal);

    // Si modelo es modelo1 y stockFinal <= puntoPedido
    if (
      (modeloNombre === "modelo1") &&
      stockFinal <= puntoPedido
    ) {
      console.log("Generando OC automáticamente para artículo:", nuevoArticulo.id);
      const tieneOC = await verificarOrdenActiva(nuevoArticulo.id);
      if (!tieneOC) {
        console.log("No hay OC activa, generando nueva OC...");
        // Buscar proveedor predeterminado activo
        const provArtSnap = await getDocs(collection(db, "Articulo", nuevoArticulo.id, "ArticuloProveedor"));
        const provPred = provArtSnap.docs.find(
          p => p.data().esProveedorPredeterminado && !p.data().fechaHoraBajaArticuloProveedor
        );
        if (!provPred) {
          alert("No hay proveedor predeterminado activo para este artículo");
          return;
        }
        const proveedor = provPred.data();
        console.log("Proveedor predeterminado encontrado:", proveedor);
        const idProveedor = proveedor.codProveedor; 
        console.log("ID del proveedor:", idProveedor); 

        // Obtener número de orden incremental
        const ordenesSnap = await getDocs(collection(db, "OrdenCompra"));
        let numeroDeOrdenCompra = 1;
        ordenesSnap.forEach(doc => {
          const orden = doc.data();
          if (orden.numeroDeOrdenCompra) {
            numeroDeOrdenCompra = Math.max(numeroDeOrdenCompra, orden.numeroDeOrdenCompra + 1);
          }
        });

        const fecha = new Date();
        const ordenRef = await addDoc(collection(db, "OrdenCompra"), {
          fechaHoraOrdenCompra: fecha,
          codProveedor: idProveedor,
          codArticulo: nuevoArticulo.id,
          numeroDeOrdenCompra,
          cantidadComprada: loteOptimo,
          totalOrdenCompra: loteOptimo * proveedor.precioUnitario,
        });

        await setDoc(
          doc(db, "OrdenCompra", ordenRef.id, "EstadoOrdenCompra", "Pendiente"),
          {
            nombreEstadoCompra: "Pendiente",
            fechaHoraAltaEstadoCompra: fecha,
            fechaHoraBajaEstadoCompra: null,
          }
        );
        console.log("Orden de compra generada:", ordenRef.id);

        alert("Se generó automáticamente una Orden de Compra por bajo stock.");
      }
    }
  };

  const handleItemChange = (campo, valor) => {
    setItem({ ...item, [campo]: valor });
  };

  const handleGuardarVenta = async (e) => {
    e.preventDefault();
    if (!item.id || !item.precioVentaArticulo || !item.cantidadVendidaArticulo) {
      return alert("Completá todos los campos");
    }

    const articulo = articulos.find((a) => a.id === item.id);
    const cantidad = parseInt(item.cantidadVendidaArticulo);
    if (!articulo) return alert("Artículo no encontrado");
    if (cantidad > articulo.stock) {
      return alert(
        "No hay suficiente stock de ${articulo.nombre}. Stock disponible: ${articulo.stock}"
      );
    }

    const fecha = new Date();
    const total = parseFloat(item.precioVentaArticulo) * cantidad;

    const ventaRef = await addDoc(collection(db, "Venta"), {
      fechaHoraVenta: fecha,
      precioTotalVenta: total,
      cantidadVendidaArticulo: cantidad,
      codArticulo: item.id,
    });

    // Actualizar stock
    const artRef = doc(db, "Articulo", item.id);
    const nuevoArticulo = articulos.find((a) => a.id === item.id);
    const nuevoStock = nuevoArticulo.stock - cantidad;
    await updateDoc(artRef, { stockActualArticulo: nuevoStock });

    // Verificar si se debe generar OC
    await verificarYGenerarOC(nuevoArticulo, nuevoStock);

    alert("Venta registrada exitosamente");
    setItem({ id: "", precioVentaArticulo: "", cantidadVendidaArticulo: "" });
  };

  const precioTotalVenta =
    parseFloat(item.precioVentaArticulo || 0) *
    parseInt(item.cantidadVendidaArticulo || 0);

  return (
    <div className="container my-4">
      <h4>➕ Registrar Venta</h4>
      <form onSubmit={handleGuardarVenta}>
        <div className="card mb-3 p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <select
                className="form-select"
                value={item.id}
                onChange={(e) => handleItemChange("id", e.target.value)}
              >
                <option value="">Seleccionar artículo</option>
                {articulos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} - Stock: {a.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Precio"
                value={item.precioVentaArticulo}
                onChange={(e) =>
                  handleItemChange("precioVentaArticulo", e.target.value)
                }
                min={0}
                step="0.01"
              />
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={item.cantidadVendidaArticulo}
                onChange={(e) =>
                  handleItemChange("cantidadVendidaArticulo", e.target.value)
                }
                min={1}
              />
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-3">
          <strong>Total de la venta:</strong> ${isNaN(precioTotalVenta) ? "0.00" : precioTotalVenta.toFixed(2)}
        </div>

        <button className="btn btn-success" type="submit">
          Registrar Venta
        </button>
      </form>
    </div>
  );
}