import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../../firebase";

export default function UpdateOrdenCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [selectedOrdenId, setSelectedOrdenId] = useState("");
  const [selectedProveedorId, setSelectedProveedorId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const ordenSnap = await getDocs(collection(db, "OrdenCompra"));
      const provSnap = await getDocs(collection(db, "Proveedor"));
      setOrdenes(ordenSnap.docs.map(d => ({
        id: d.id,
        fecha: d.data().fechaHoraOrdenCompra?.toDate(),
        codProveedor: d.data().codProveedor,
      })));
      setProveedores(provSnap.docs.map(d => ({ id: d.id, nombre: d.data().nombreProveedor })));
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedOrdenId) return;
    const orden = ordenes.find(o => o.id === selectedOrdenId);
    if (orden) setSelectedProveedorId(orden.codProveedor || "");
  }, [selectedOrdenId]);

  const handleUpdate = async () => {
    if (!selectedOrdenId || !selectedProveedorId) return;
    const ref = doc(db, "OrdenCompra", selectedOrdenId);
    await updateDoc(ref, { codProveedor: selectedProveedorId });
    alert("Orden actualizada");
  };

  return (
    <div className="container my-4">
      <h4>✏️ Actualizar Orden de Compra</h4>

      <select
        className="form-select mb-3"
        value={selectedOrdenId}
        onChange={(e) => setSelectedOrdenId(e.target.value)}
      >
        <option value="">Seleccionar orden</option>
        {ordenes.map((o) => (
          <option key={o.id} value={o.id}>
            #{o.id} - {o.fecha?.toLocaleString()}
          </option>
        ))}
      </select>

      {selectedOrdenId && (
        <>
          <select
            className="form-select mb-3"
            value={selectedProveedorId}
            onChange={(e) => setSelectedProveedorId(e.target.value)}
          >
            <option value="">Seleccionar nuevo proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <button className="btn btn-warning" onClick={handleUpdate}>
            Actualizar
          </button>
        </>
      )}
    </div>
  );
}
