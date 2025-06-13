import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import db from "../../firebase";

export default function DeleteModeloInventario() {
  const [modelos, setModelos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "ModeloInventario"));
      const art = await getDocs(collection(db, "Articulos"));

      setModelos(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((m) => !m.fechahorabaja) // excluir los dados de baja
      );
      setArticulos(
        art.docs
          .map((d) => ({
            id: d.id,
            nombre: d.data().nombreArticulo,
            baja: d.data().fechahorabaja || null,
          }))
          .filter((a) => !a.baja)
      );
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;
    const confirm = window.confirm("¿Dar de baja este modelo de inventario?");
    if (!confirm) return;

    await updateDoc(doc(db, "ModeloInventario", selectedId), {
      fechahorabaja: Timestamp.now(),
    });

    alert("Modelo dado de baja correctamente");
    setModelos(modelos.filter((m) => m.id !== selectedId));
    setSelectedId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Dar de baja Modelo de Inventario</h4>

      <select
        className="form-select mb-3"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Seleccionar modelo</option>
        {modelos.map((m) => {
          // Si el artículo asociado está dado de baja, tampoco se muestra el modelo
          const art = articulos.find((a) => a.id === m.codArticulo);
          if (!art) return null;
          return (
            <option key={m.id} value={m.id}>
              {m.nombreModeloInventario} - {art.nombre}
            </option>
          );
        })}
      </select>

      <button className="btn btn-danger" onClick={handleDelete} disabled={!selectedId}>
        Dar de baja
      </button>
    </div>
  );
}
