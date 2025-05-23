import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddOrdenCompra() {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorId, setProveedorId] = useState("");

  useEffect(() => {
    const fetchProveedores = async () => {
      const snap = await getDocs(collection(db, "Proveedor"));
      const lista = snap.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombreProveedor,
      }));
      setProveedores(lista);
    };
    fetchProveedores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proveedorId) return alert("Seleccioná un proveedor");

    const fechaActual = new Date();

    // 1. Crear la orden de compra con codProveedor
    const ordenRef = await addDoc(collection(db, "OrdenCompra"), {
      fechaHoraOrdenCompra: fechaActual,
      codProveedor: proveedorId,
    });

    // 2. Crear el estado inicial 'Pendiente'
    await setDoc(doc(db, "OrdenCompra", ordenRef.id, "EstadoOrdenCompra", "Pendiente"), {
      nombreEstadoCompra: "Pendiente",
      fechaHoraAltaEstadoCompra: fechaActual,
      fechaHoraBajaEstadoCompra: null,
    });

    alert("Orden de compra creada");
    setProveedorId("");
  };

  return (
    <form onSubmit={handleSubmit} className="container my-4">
      <h4>➕ Crear Orden de Compra</h4>

      <select
        className="form-select mb-3"
        value={proveedorId}
        onChange={(e) => setProveedorId(e.target.value)}
      >
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <button className="btn btn-primary">Crear Orden</button>
    </form>
  );
}
