import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import db from "../../firebase";

export default function DeleteProveedor() {
  const [proveedores, setProveedores] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "Proveedor"));
      const lista = snap.docs.map(d => ({
        id: d.id,
        nombre: d.data().nombreProveedor,
      }));
      setProveedores(lista);
    };
    fetch();
  }, []);

  const handleDelete = async () => {
    const confirm = window.confirm("¿Estás seguro de eliminar este proveedor?");
    if (!confirm || !selectedId) return;

    await deleteDoc(doc(db, "Proveedor", selectedId));
    setProveedores(prev => prev.filter(p => p.id !== selectedId));
    setSelectedId("");
    alert("Proveedor eliminado");
  };

  return (
    <div className="container my-4">
      <h4>Eliminar Proveedor</h4>

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
        Eliminar
      </button>
    </div>
  );
}
