import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import db from "../../firebase";

export default function DeleteVenta() {
  const [ventas, setVentas] = useState([]);
  const [selectedVentaId, setSelectedVentaId] = useState("");

  useEffect(() => {
    const fetchVentas = async () => {
      const snap = await getDocs(collection(db, "Venta"));
      const lista = snap.docs
        .map((d) => ({
          id: d.id,
          baja: d.data().fechaHoraBajaVenta || null,
        }))
        .filter((v) => !v.baja); // mostrar solo ventas activas
      setVentas(lista);
    };
    fetchVentas();
  }, []);

  const handleDelete = async () => {
    if (!selectedVentaId) return;

    const confirm = window.confirm("¿Seguro que querés dar de baja esta venta y su detalle?");
    if (!confirm) return;

    // 1. Baja lógica en DetalleVenta
    const detalleSnap = await getDocs(collection(db, "Venta", selectedVentaId, "DetalleVenta"));
    for (const docu of detalleSnap.docs) {
      const detalleRef = doc(db, "Venta", selectedVentaId, "DetalleVenta", docu.id);
      const data = docu.data();
      if (!data.fechaHoraBajaDetalleVenta) {
        await updateDoc(detalleRef, {
          fechaHoraBajaDetalleVenta: Timestamp.now(),
        });
      }
    }

    // 2. Baja lógica de la venta principal
    const ventaRef = doc(db, "Venta", selectedVentaId);
    await updateDoc(ventaRef, {
      fechaHoraBajaVenta: Timestamp.now(),
    });

    alert("Venta dada de baja correctamente");
    setVentas((prev) => prev.filter((v) => v.id !== selectedVentaId));
    setSelectedVentaId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Dar de baja Venta</h4>

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
        Dar de baja Venta
      </button>
    </div>
  );
}
