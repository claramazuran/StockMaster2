import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import db from "../../firebase";

export default function DeleteOrdenCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [selectedOrdenId, setSelectedOrdenId] = useState("");

  useEffect(() => {
    const fetchOrdenes = async () => {
      const snap = await getDocs(collection(db, "OrdenCompra"));
      const lista = snap.docs
        .map((d) => ({
          id: d.id,
          fecha: d.data().fechaHoraOrdenCompra?.toDate(),
          baja: d.data().fechaHoraBajaOrdenCompra,
        }))
        .filter((o) => !o.baja); // mostrar solo las no dadas de baja
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
        return alert(`No se puede dar de baja la orden porque está en estado "${estadoActual}".`);
      }
    }

    const confirm = window.confirm("¿Dar de baja esta orden y sus estados?");
    if (!confirm) return;

    // 1. Baja lógica en estados
    const estadosSnap = await getDocs(collection(db, "OrdenCompra", selectedOrdenId, "EstadoOrdenCompra"));
    for (const estado of estadosSnap.docs) {
      await updateDoc(doc(db, "OrdenCompra", selectedOrdenId, "EstadoOrdenCompra", estado.id), {
        fechaHoraBajaEstadoCompra: Timestamp.now(),
      });
    }

    // 2. Baja lógica de la orden principal
    await updateDoc(doc(db, "OrdenCompra", selectedOrdenId), {
      fechaHoraBajaOrdenCompra: Timestamp.now(),
    });

    alert("Orden dada de baja correctamente.");
    setOrdenes((prev) => prev.filter((o) => o.id !== selectedOrdenId));
    setSelectedOrdenId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Dar de baja Orden de Compra</h4>

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
        Dar de baja
      </button>
    </div>
  );
}
