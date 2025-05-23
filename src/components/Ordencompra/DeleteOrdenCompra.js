import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import db from "../../firebase/config";

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

    const confirm = window.confirm("¿Eliminar esta orden y sus estados?");
    if (!confirm) return;

    // 1. Borrar subcolección EstadoOrdenCompra (documentos individuales)
    const estadosSnap = await getDocs(collection(db, "OrdenCompra", selectedOrdenId, "EstadoOrdenCompra"));
    for (const estado of estadosSnap.docs) {
      await deleteDoc(doc(db, "OrdenCompra", selectedOrdenId, "EstadoOrdenCompra", estado.id));
    }

    // 2. Borrar la orden en sí
    await deleteDoc(doc(db, "OrdenCompra", selectedOrdenId));

    alert("Orden eliminada");
    setOrdenes(ordenes.filter(o => o.id !== selectedOrdenId));
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
