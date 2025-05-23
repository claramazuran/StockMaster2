import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../../firebase/config";

export default function UpdateProveedor() {
  const [proveedores, setProveedores] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [proveedor, setProveedor] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "Proveedor"));
      const lista = snap.docs.map(d => ({ id: d.id, nombre: d.data().nombreProveedor }));
      setProveedores(lista);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const load = async () => {
      const ref = doc(db, "Proveedor", selectedId);
      const snap = await getDoc(ref);
      if (snap.exists()) setProveedor(snap.data());
    };
    load();
  }, [selectedId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const ref = doc(db, "Proveedor", selectedId);
    await updateDoc(ref, {
      nombreProveedor: proveedor.nombreProveedor,
      nroTelefonoProveedor: proveedor.nroTelefonoProveedor,
    });
    alert("Proveedor actualizado");
  };

  return (
    <div className="container my-4">
      <h4>Actualizar Proveedor</h4>

      <select
        className="form-select mb-3"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Seleccionar proveedor</option>
        {proveedores.map(p => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      {proveedor && (
        <form onSubmit={handleUpdate}>
          <input
            className="form-control mb-2"
            value={proveedor.nombreProveedor}
            onChange={(e) =>
              setProveedor({ ...proveedor, nombreProveedor: e.target.value })
            }
          />
          <input
            className="form-control mb-2"
            value={proveedor.nroTelefonoProveedor}
            onChange={(e) =>
              setProveedor({ ...proveedor, nroTelefonoProveedor: e.target.value })
            }
          />
          <button className="btn btn-warning">Actualizar</button>
        </form>
      )}
    </div>
  );
}
