// ✅ DeleteArticulo.js con validación de baja completa
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
        stock: doc.data().stockActualArticulo || 0
      }));
      setArticulos(lista);
    };
    fetchArticulos();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return alert("Seleccioná un artículo");

    const articulo = articulos.find(a => a.id === selectedId);
    if (!articulo) return;

    if (articulo.stock > 0) return alert("No se puede eliminar un artículo con stock disponible");

    const ordenes = await getDocs(collection(db, "OrdenCompra"));
    for (const orden of ordenes.docs) {
      const detalles = await getDocs(collection(db, "OrdenCompra", orden.id, "DetalleOrdenCompra"));
      for (const detalle of detalles.docs) {
        const articulosDetalle = await getDocs(collection(db, "OrdenCompra", orden.id, "DetalleOrdenCompra", detalle.id, "articulos"));
        for (const ad of articulosDetalle.docs) {
          if (ad.id === selectedId) return alert("No se puede eliminar un artículo con orden de compra pendiente o enviada");
        }
      }
    }

    const confirm = window.confirm("¿Estás seguro de eliminar este artículo?");
    if (!confirm) return;
    await deleteDoc(doc(db, "Articulos", selectedId));
    alert("Artículo eliminado");
    setArticulos(articulos.filter((a) => a.id !== selectedId));
    setSelectedId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Eliminar Artículo</h4>
      <select className="form-select mb-3" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.nombre}</option>
        ))}
      </select>
      <button className="btn btn-danger" onClick={handleDelete} disabled={!selectedId}>Eliminar</button>
    </div>
  );
}
