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

export default function DeleteProveedorArticulo() {
  const [articulos, setArticulos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [articuloId, setArticuloId] = useState("");
  const [proveedorId, setProveedorId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const artSnap = await getDocs(collection(db, "Articulos"));
      const provSnap = await getDocs(collection(db, "Proveedor"));
      setArticulos(artSnap.docs.map(d => ({ id: d.id, nombre: d.data().nombreArticulo })));
      setProveedores(provSnap.docs.map(d => ({ id: d.id, nombre: d.data().nombreProveedor })));
    };
    fetch();
  }, []);

  const handleDelete = async () => {
    if (!articuloId || !proveedorId)
      return alert("Seleccioná artículo y proveedor");

    const confirm = window.confirm("¿Dar de baja esta relación proveedor-artículo?");
    if (!confirm) return;

    const docRef = doc(db, "Articulos", articuloId, "ProveedorArticulo", proveedorId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return alert("La relación no existe.");
    }

    const data = snap.data();
    if (data.fechaHoraBajaProveedorArticulo) {
      return alert("Ya se encuentra dada de baja.");
    }

    await updateDoc(docRef, {
      fechaHoraBajaProveedorArticulo: Timestamp.now(),
    });

    alert("Relación dada de baja correctamente");
    setProveedorId("");
  };

  return (
    <div className="container my-4">
      <h4>🗑️ Dar de baja Proveedor-Artículo</h4>

      <select className="form-select mb-2" value={articuloId} onChange={(e) => setArticuloId(e.target.value)}>
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.nombre}</option>
        ))}
      </select>

      <select className="form-select mb-3" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      <button
        className="btn btn-danger"
        onClick={handleDelete}
        disabled={!articuloId || !proveedorId}
      >
        Dar de baja
      </button>
    </div>
  );
}
