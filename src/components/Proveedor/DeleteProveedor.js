import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import db from "../../firebase";

export default function DeleteProveedor() {
  const [proveedores, setProveedores] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "Proveedor"));
      const lista = snap.docs
        .map(d => ({
          id: d.id,
          nombre: d.data().nombreProveedor,
          baja: d.data().fechaHoraBajaProveedor || null,
        }))
        .filter(p => !p.baja); // Excluir proveedores dados de baja
      setProveedores(lista);
    };
    fetch();
  }, []);

  const validarBaja = async (idProveedor) => {
    // 🔍 1. Verificar si es proveedor predeterminado en algún artículo
    const artSnap = await getDocs(collection(db, "Articulos"));
    for (const art of artSnap.docs) {
      const subSnap = await getDocs(
        collection(db, "Articulos", art.id, "ProveedorArticulo")
      );
      const algunoPredeterminado = subSnap.docs.some(
        d =>
          d.id === idProveedor &&
          d.data().esProveedorPredeterminado === true
      );
      if (algunoPredeterminado) {
        alert("❌ No se puede dar de baja: es proveedor predeterminado en un artículo.");
        return false;
      }
    }

    // 🔍 2. Verificar si tiene órdenes de compra activas
    const ocSnap = await getDocs(
      query(collection(db, "OrdenCompra"), where("codProveedor", "==", idProveedor))
    );

    for (const orden of ocSnap.docs) {
      const estadosSnap = await getDocs(
        collection(db, "OrdenCompra", orden.id, "EstadoOrdenCompra")
      );
      const sigueActiva = estadosSnap.docs.some(
        d => d.data().fechaHoraBajaEstadoCompra === null
      );
      if (sigueActiva) {
        alert("❌ No se puede dar de baja: tiene una orden de compra pendiente o en curso.");
        return false;
      }
    }

    return true;
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    const confirm = window.confirm("¿Estás seguro de dar de baja este proveedor?");
    if (!confirm) return;

    const puedeBorrar = await validarBaja(selectedId);
    if (!puedeBorrar) return;

    await updateDoc(doc(db, "Proveedor", selectedId), {
      fechaHoraBajaProveedor: Timestamp.now(),
    });

    setProveedores(prev => prev.filter(p => p.id !== selectedId));
    setSelectedId("");
    alert("Proveedor dado de baja correctamente");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Dar de baja Proveedor</h4>

      <select
        className="form-select mb-3"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      <button
        className="btn btn-danger"
        onClick={handleDelete}
        disabled={!selectedId}
      >
        Dar de baja
      </button>
    </div>
  );
}
