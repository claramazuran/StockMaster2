// src/components/Proveedor/DeleteProveedor.js
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import db from "../../firebase";

export default function DeleteProveedor() {
  const [nombre, setNombre] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    const ref = doc(db, "proveedor", nombre)

    await deleteDoc(ref);

    alert("Proveedor eliminado");
    setNombre("");
  };

  return (
    <form onSubmit={handleDelete} className="container my-3">
      <h4>Eliminar Proveedor</h4>
      <input
        className="form-control mb-2"
        placeholder="Nombre del proveedor (ID)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button className="btn btn-danger">Eliminar</button>
    </form>
  );
}
