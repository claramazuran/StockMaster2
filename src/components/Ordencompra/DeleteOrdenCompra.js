import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import db from "../../firebase";

export default function DeleteOrdenCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [selectedOrdenId, setSelectedOrdenId] = useState("");

  useEffect(() => {
    const fetchOrdenes = async () => {
      const snap = await getDocs(collection(db, "OrdenCompra"));
      const lista = snap.docs.map((d) => ({
        id: d.id,
        fecha: d.data().fechaHoraOrdenCompra?.toDate(),
      }));
      setOrdenes(lista);
    };
    fetchOrdenes();
  }, []);

  const handleDelete = async () => {
    if (!selectedOrdenId) return;

    // Verificar estado actual
    const estadoRef = collection(db, "OrdenCompra", selectedOrdenId, "EstadoOrdenCompra");
    const q = query(estadoRef, where("fechaHoraBajaEstadoCompra", "==", null));
    const estadoSnap = await getDocs(q);
    if (!estadoSnap.empty) {
      const estadoActual = estadoSnap.docs[0].data().nombreEstadoCompra;
      if (["Enviada", "Finalizada"].includes(estadoActual)) {
        return alert(`No se puede eliminar la orden porque está en estado "${estadoActual}".`);
      }
    }

    const confirm = window.confirm("¿Eliminar esta orden y sus estados?");
    if (!confirm) return;

    // 1. Eliminar estados
    const estadosSnap = await getDocs(collection(db, "OrdenCompra", selectedOrdenId, "EstadoOrdenCompra"));
    for (const estado of estadosSnap.docs) {
      await deleteDoc(doc(db, "OrdenCompra", selectedOrdenId, "EstadoOrdenCompra", estado.id));
    }

    // 2. Eliminar detalles y artículos
    const detallesSnap = await getDocs(collection(db, "OrdenCompra", selectedOrdenId, "DetalleOrdenCompra"));
    for (const detalle of detallesSnap.docs) {
      const artSnap = await getDocs(collection(db, "OrdenCompra", selectedOrdenId, "DetalleOrdenCompra", detalle.id, "articulos"));
      for (const art of artSnap.docs) {
        await deleteDoc(doc(db, "OrdenCompra", selectedOrdenId, "DetalleOrdenCompra", detalle.id, "articulos", art.id));
      }
      await deleteDoc(doc(db, "OrdenCompra", selectedOrdenId, "DetalleOrdenCompra", detalle.id));
    }

    // 3. Eliminar la orden
    await deleteDoc(doc(db, "OrdenCompra", selectedOrdenId));

    alert("Orden eliminada correctamente.");
    setOrdenes((prev) => prev.filter((o) => o.id !== selectedOrdenId));
    setSelectedOrdenId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Eliminar Orden de Compra</h4>

      <select
        className="form-select mb-3"
        value={selectedOrdenId}
        onChange={(e) => setSelectedOrdenId(e.target.value)}
      >
        <option value="">Seleccionar orden</option>
        {ordenes.map((o) => (
          <option key={o.id} value={o.id}>
            #{o.id} - {o.fecha?.toLocaleString()}
          </option>
        ))}
      </select>

      <button
        className="btn btn-danger"
        onClick={handleDelete}
        disabled={!selectedOrdenId}
      >
        Eliminar
      </button>
    </div>
  );
}
