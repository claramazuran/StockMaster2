import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddProveedor() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !telefono) return alert("Todos los campos son requeridos");

    await addDoc(collection(db, "Proveedor"), {
      nombreProveedor: nombre,
      nroTelefonoProveedor: telefono,
      fechaHoraAltaProveedor: new Date(),
      fechaHoraBajaProveedor: null,
    });

    alert("Proveedor agregado");
    setNombre("");
    setTelefono("");
  };

  return (
    <form onSubmit={handleSubmit} className="container my-3">
      <h4>Agregar Proveedor</h4>
      <input
        className="form-control mb-2"
        placeholder="Nombre del proveedor"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Teléfono del proveedor"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />
      <button className="btn btn-success">Agregar</button>
    </form>
  );
}
