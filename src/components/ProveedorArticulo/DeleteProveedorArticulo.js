import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import db from "../../firebase";

export default function DeleteProveedorArticulo() {
  const [articulos, setArticulos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [articuloId, setArticuloId] = useState("");
  const [proveedorId, setProveedorId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const artSnap = await getDocs(collection(db, "Articulos"));
      const provSnap = await getDocs(collection(db, "Proveedor"));
      setArticulos(artSnap.docs.map(d => ({ id: d.id, descripcion: d.data().descripcionArticulo })));
      setProveedores(provSnap.docs.map(d => ({ id: d.id, nombre: d.data().nombreProveedor })));
    };
    fetch();
  }, []);

  const handleDelete = async () => {
    if (!articuloId || !proveedorId) return alert("Seleccioná artículo y proveedor");
    const confirm = window.confirm("¿Eliminar esta relación proveedor-artículo?");
    if (!confirm) return;

    await deleteDoc(doc(db, "Articulos", articuloId, "ProveedorArticulo", proveedorId));
    alert("Eliminado correctamente");
    setProveedorId("");
  };

  return (
    <div className="container my-4">
      <h4>Eliminar Proveedor-Artículo</h4>

      <select className="form-select mb-2" value={articuloId} onChange={(e) => setArticuloId(e.target.value)}>
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.descripcion}</option>
        ))}
      </select>

      <select className="form-select mb-3" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      <button className="btn btn-danger" onClick={handleDelete} disabled={!articuloId || !proveedorId}>
        Eliminar
      </button>
    </div>
  );
}
