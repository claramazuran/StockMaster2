import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import db from "../../firebase";

export default function DeleteVenta() {
  const [ventas, setVentas] = useState([]);
  const [selectedVentaId, setSelectedVentaId] = useState("");

  useEffect(() => {
    const fetchVentas = async () => {
      const snap = await getDocs(collection(db, "Venta"));
      setVentas(snap.docs.map((d) => ({ id: d.id })));
    };
    fetchVentas();
  }, []);

  const handleDelete = async () => {
    if (!selectedVentaId) return;

    const confirm = window.confirm("¿Seguro que querés eliminar esta venta y su detalle?");
    if (!confirm) return;

    const detalleSnap = await getDocs(
      collection(db, "Venta", selectedVentaId, "DetalleVenta")
    );
    for (const docu of detalleSnap.docs) {
      await deleteDoc(doc(db, "Venta", selectedVentaId, "DetalleVenta", docu.id));
    }

    await deleteDoc(doc(db, "Venta", selectedVentaId));

    alert("Venta eliminada");
    setVentas(ventas.filter((v) => v.id !== selectedVentaId));
    setSelectedVentaId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Eliminar Venta</h4>

      <select
        className="form-select mb-3"
        value={selectedVentaId}
        onChange={(e) => setSelectedVentaId(e.target.value)}
      >
        <option value="">Seleccionar venta</option>
        {ventas.map((v) => (
          <option key={v.id} value={v.id}>
            Venta #{v.id}
          </option>
        ))}
      </select>

      <button
        className="btn btn-danger"
        disabled={!selectedVentaId}
        onClick={handleDelete}
      >
        Eliminar Venta
      </button>
    </div>
  );
}
