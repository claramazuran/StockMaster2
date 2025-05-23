import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import db from "../../firebase/config";

export default function DeleteDetalleOrdenCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [ordenId, setOrdenId] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [detalleId, setDetalleId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const ordenSnap = await getDocs(collection(db, "OrdenCompra"));
      setOrdenes(ordenSnap.docs.map((d) => ({ id: d.id })));
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!ordenId) return;
    const fetchDetalles = async () => {
      const detalleSnap = await getDocs(collection(db, "OrdenCompra", ordenId, "DetalleOrdenCompra"));
      setDetalles(detalleSnap.docs.map(d => ({ id: d.id })));
    };
    fetchDetalles();
  }, [ordenId]);

  const handleDelete = async () => {
    if (!ordenId || !detalleId) return;

    const confirm = window.confirm("¿Eliminar este detalle y todos sus artículos?");
    if (!confirm) return;

    const articulosSnap = await getDocs(collection(db, "OrdenCompra", ordenId, "DetalleOrdenCompra", detalleId, "articulos"));
    for (const art of articulosSnap.docs) {
      await deleteDoc(doc(db, "OrdenCompra", ordenId, "DetalleOrdenCompra", detalleId, "articulos", art.id));
    }

    await deleteDoc(doc(db, "OrdenCompra", ordenId, "DetalleOrdenCompra", detalleId));

    alert("Detalle eliminado");
    setDetalleId("");
    setDetalles(detalles.filter(d => d.id !== detalleId));
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Eliminar Detalle de Orden</h4>

      <select className="form-select mb-3" value={ordenId} onChange={(e) => setOrdenId(e.target.value)}>
        <option value="">Seleccionar orden</option>
        {ordenes.map((o) => (
          <option key={o.id} value={o.id}>Orden #{o.id}</option>
        ))}
      </select>

      {ordenId && (
        <select className="form-select mb-3" value={detalleId} onChange={(e) => setDetalleId(e.target.value)}>
          <option value="">Seleccionar detalle</option>
          {detalles.map((d) => (
            <option key={d.id} value={d.id}>Detalle #{d.id}</option>
          ))}
        </select>
      )}

      <button className="btn btn-danger" onClick={handleDelete} disabled={!detalleId}>
        Eliminar
      </button>
    </div>
  );
}
