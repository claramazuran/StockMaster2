import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddOrdenConDetalle() {
  const [proveedores, setProveedores] = useState([]);
  const [articulosProveedor, setArticulosProveedor] = useState([]);
  const [proveedorId, setProveedorId] = useState("");
  const [items, setItems] = useState([]);

  // Traer proveedores activos
  useEffect(() => {
    const fetchProveedores = async () => {
      const provSnap = await getDocs(collection(db, "Proveedor"));
      setProveedores(
        provSnap.docs
          .map(doc => ({
            id: doc.id,
            nombre: doc.data().nombreProveedor,
            baja: doc.data().fechaHoraBajaProveedor || null,
          }))
          .filter(p => !p.baja)
      );
    };
    fetchProveedores();
  }, []);

  // Cuando se elige proveedor, traer solo los artículos activos que ese proveedor tiene registrado y que la relación también esté activa
  useEffect(() => {
    const fetchArticulosDelProveedor = async () => {
      if (!proveedorId) {
        setArticulosProveedor([]);
        return;
      }
      const artSnap = await getDocs(collection(db, "Articulos"));
      const disponibles = [];
      for (const d of artSnap.docs) {
        // Filtrar artículos dados de baja lógica
        if (d.data().fechahorabaja) continue;

        const provArtSnap = await getDocs(collection(db, "Articulos", d.id, "ProveedorArticulo"));
        // Solo relaciones proveedor-artículo activas
        if (
          provArtSnap.docs.some(
            docProv =>
              docProv.data().codProveedor === proveedorId &&
              !docProv.data().fechaHoraBajaProveedorArticulo
          )
        ) {
          disponibles.push({ id: d.id, nombre: d.data().nombreArticulo });
        }
      }
      setArticulosProveedor(disponibles);
    };
    fetchArticulosDelProveedor();
    setItems([]); // Limpiar items al cambiar proveedor
  }, [proveedorId]);

  // FUNCION CLAVE: verificar si ya existe OC activa para ese artículo y proveedor
  const existeOCActiva = async (codArticulo, proveedorId) => {
    const ocSnap = await getDocs(collection(db, "OrdenCompra"));
    for (const oc of ocSnap.docs) {
      // Solo órdenes de este proveedor
      if (oc.data().codProveedor !== proveedorId) continue;
      // Verificar que la orden no esté dada de baja lógica
      if (oc.data().fechaHoraBajaOrdenCompra) continue;
      // Buscar estado actual
      const estados = await getDocs(collection(db, "OrdenCompra", oc.id, "EstadoOrdenCompra"));
      const estadoActual = estados.docs.find(e => e.data().fechaHoraBajaEstadoCompra === null);
      if (!estadoActual) continue;
      const estado = estadoActual.data().nombreEstadoCompra;
      if (!["Pendiente", "Enviada"].includes(estado)) continue;
      // Buscar detalles y artículos
      const detalles = await getDocs(collection(db, "OrdenCompra", oc.id, "DetalleOrdenCompra"));
      for (const det of detalles.docs) {
        const articulos = await getDocs(collection(db, "OrdenCompra", oc.id, "DetalleOrdenCompra", det.id, "articulos"));
        if (articulos.docs.some(a => a.id === codArticulo)) {
          return true;
        }
      }
    }
    return false;
  };

  const handleAgregarItem = () => {
    setItems([...items, { codArticulo: "", precioArticulo: "", cantidad: "" }]);
  };

  const handleEliminarItem = (index) => {
    const nuevo = [...items];
    nuevo.splice(index, 1);
    setItems(nuevo);
  };

  const handleItemChange = (index, campo, valor) => {
    const nuevo = [...items];
    nuevo[index][campo] = valor;
    setItems(nuevo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proveedorId || items.length === 0) return alert("Seleccioná un proveedor y agregá al menos un artículo");

    // Verificar existencia de OC activa por artículo y proveedor
    for (const item of items) {
      const yaExiste = await existeOCActiva(item.codArticulo, proveedorId);
      if (yaExiste) {
        return alert("Ya existe una Orden de Compra activa (pendiente o enviada) para este artículo con el proveedor seleccionado.");
      }
    }

    const fecha = new Date();
    const precioTotal = items.reduce(
      (total, item) => total + parseFloat(item.precioArticulo || 0) * parseInt(item.cantidad || 0),
      0
    );

    const ordenRef = await addDoc(collection(db, "OrdenCompra"), {
      fechaHoraOrdenCompra: fecha,
      codProveedor: proveedorId,
    });

    await setDoc(doc(db, "OrdenCompra", ordenRef.id, "EstadoOrdenCompra", "Pendiente"), {
      nombreEstadoCompra: "Pendiente",
      fechaHoraAltaEstadoCompra: fecha,
      fechaHoraBajaEstadoCompra: null,
    });

    const detalleRef = await addDoc(collection(db, "OrdenCompra", ordenRef.id, "DetalleOrdenCompra"), {
      fechaHoraAlta: fecha,
      fechaHoraBaja: null,
      precioTotal,
    });

    const articulosRef = collection(db, "OrdenCompra", ordenRef.id, "DetalleOrdenCompra", detalleRef.id, "articulos");
    for (const item of items) {
      await setDoc(doc(articulosRef, item.codArticulo), {
        codArticulo: item.codArticulo,
        precioArticulo: parseFloat(item.precioArticulo),
        cantidad: parseInt(item.cantidad),
      });
    }

    alert("Orden de compra con detalle registrada correctamente");
    setProveedorId("");
    setItems([]);
  };

  return (
    <form onSubmit={handleSubmit} className="container my-4">
      <h4>➕ Crear Orden de Compra con Artículos</h4>

      <select
        className="form-select mb-3"
        value={proveedorId}
        onChange={(e) => setProveedorId(e.target.value)}
      >
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      <button
        type="button"
        className="btn btn-outline-primary mb-3"
        onClick={handleAgregarItem}
        disabled={!proveedorId}
      >
        ➕ Agregar Artículo
      </button>

      {items.map((item, i) => (
        <div key={i} className="card mb-3 p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <select
                className="form-select"
                value={item.codArticulo}
                onChange={(e) => handleItemChange(i, "codArticulo", e.target.value)}
              >
                <option value="">Seleccionar artículo</option>
                {articulosProveedor.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Precio"
                value={item.precioArticulo}
                onChange={(e) => handleItemChange(i, "precioArticulo", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={item.cantidad}
                onChange={(e) => handleItemChange(i, "cantidad", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-danger w-100"
                type="button"
                onClick={() => handleEliminarItem(i)}
              >
                ➖
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="btn btn-success" type="submit" disabled={!proveedorId}>
        Crear Orden con Detalle
      </button>
    </form>
  );
}
