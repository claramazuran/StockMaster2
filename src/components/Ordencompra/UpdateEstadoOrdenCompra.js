import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import db from "../../firebase";

export default function UpdateEstadoOrdenCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [selectedOrdenId, setSelectedOrdenId] = useState("");
  const [estadoActual, setEstadoActual] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");

  const estadosDisponibles = [
    "Pendiente",
    "Aprobada",
    "En Proceso",
    "Completada",
    "Cancelada",
  ];

  useEffect(() => {
    const fetchOrdenes = async () => {
      const snap = await getDocs(collection(db, "OrdenCompra"));
      setOrdenes(
        snap.docs.map((d) => ({
          id: d.id,
          fecha: d.data().fechaHoraOrdenCompra?.toDate(),
        }))
      );
    };
    fetchOrdenes();
  }, []);

  useEffect(() => {
    const fetchEstadoActual = async () => {
      if (!selectedOrdenId) return;
      const estadoRef = collection(
        db,
        "OrdenCompra",
        selectedOrdenId,
        "EstadoOrdenCompra"
      );
      const q = query(estadoRef, where("fechaHoraBajaEstadoCompra", "==", null));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docActivo = snap.docs[0];
        setEstadoActual({ id: docActivo.id, ...docActivo.data() });
      } else {
        setEstadoActual(null);
      }
    };
    fetchEstadoActual();
  }, [selectedOrdenId]);

  const handleActualizarEstado = async () => {
    if (!nuevoEstado || !estadoActual) return;

    // Bloquear modificación si el estado actual es final
    if (
      ["Enviada", "Finalizada", "Completada", "Cancelada"].includes(
        estadoActual.nombreEstadoCompra
      )
    ) {
      return alert(
        `La orden está en estado "${estadoActual.nombreEstadoCompra}" y no puede ser modificada`
      );
    }

    const fecha = new Date();

    // 1. Cerrar estado actual
    const actualRef = doc(
      db,
      "OrdenCompra",
      selectedOrdenId,
      "EstadoOrdenCompra",
      estadoActual.id
    );
    await updateDoc(actualRef, {
      fechaHoraBajaEstadoCompra: fecha,
    });

    // 2. Crear nuevo estado
    const nuevoRef = doc(
      db,
      "OrdenCompra",
      selectedOrdenId,
      "EstadoOrdenCompra",
      nuevoEstado
    );
    await setDoc(nuevoRef, {
      nombreEstadoCompra: nuevoEstado,
      fechaHoraAltaEstadoCompra: fecha,
      fechaHoraBajaEstadoCompra: null,
    });

    alert(`Estado actualizado a ${nuevoEstado}`);
    setEstadoActual({
      nombreEstadoCompra: nuevoEstado,
      fechaHoraAltaEstadoCompra: fecha,
      fechaHoraBajaEstadoCompra: null,
    });
    setNuevoEstado("");
  };

  return (
    <div className="container my-4">
      <h4>✏️ Actualizar Estado de Orden de Compra</h4>

      <select
        className="form-select mb-3"
        value={selectedOrdenId}
        onChange={(e) => setSelectedOrdenId(e.target.value)}
      >
        <option value="">Seleccionar Orden</option>
        {ordenes.map((o) => (
          <option key={o.id} value={o.id}>
            Orden #{o.id} - {o.fecha?.toLocaleString()}
          </option>
        ))}
      </select>

      {estadoActual && (
        <div className="mb-3">
          <strong>Estado actual:</strong> {estadoActual.nombreEstadoCompra}
        </div>
      )}

      <select
        className="form-select mb-3"
        value={nuevoEstado}
        onChange={(e) => setNuevoEstado(e.target.value)}
        disabled={!estadoActual}
      >
        <option value="">Seleccionar nuevo estado</option>
        {estadosDisponibles
          .filter((e) => e !== estadoActual?.nombreEstadoCompra)
          .map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
      </select>

      <button
        className="btn btn-warning"
        onClick={handleActualizarEstado}
        disabled={!nuevoEstado}
      >
        Actualizar Estado
      </button>
    </div>
  );
}
