import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import db from "../../firebase";

export default function DeleteArticulo() {
  const [articulos, setArticulos] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetchArticulos = async () => {
      const snapshot = await getDocs(collection(db, "Articulos"));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombreArticulo,
      }));
      setArticulos(lista);
    };
    fetchArticulos();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return alert("Seleccioná un artículo");
    const confirm = window.confirm("¿Estás seguro de eliminar este artículo?");
    if (!confirm) return;

    await deleteDoc(doc(db, "Articulos", selectedId));
    alert("Artículo eliminado");

    // Actualizar lista
    setArticulos(articulos.filter((a) => a.id !== selectedId));
    setSelectedId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Eliminar Artículo</h4>

      <select
        className="form-select mb-3"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.nombre}</option>
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
