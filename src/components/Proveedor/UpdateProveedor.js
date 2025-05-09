// src/components/Proveedor/UpdateProveedor.js
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import db from "../../firebase";

export default function UpdateProveedor() {
  const [nombre, setNombre] = useState("");
  const [nuevaInfo, setNuevaInfo] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const ref = doc(db, "proveedor", nombre)

    await updateDoc(ref, { infoExtra: nuevaInfo });

    alert("Proveedor actualizado");
    setNombre("");
    setNuevaInfo("");
  };

  return (
    <form onSubmit={handleUpdate} className="container my-3">
      <h4>Actualizar Proveedor</h4>
      <input
        className="form-control mb-2"
        placeholder="Nombre del proveedor (ID)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Nueva información"
        value={nuevaInfo}
        onChange={(e) => setNuevaInfo(e.target.value)}
      />
      <button className="btn btn-warning">Actualizar</button>
    </form>
  );
}
