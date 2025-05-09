// src/components/Proveedor/AddProveedor.js
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddProveedor() {
  const [nombre, setNombre] = useState("");
  const [infoExtra, setInfoExtra] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return alert("Nombre es requerido");

    const ref = doc(db, "proveedor", nombre)

    await setDoc(ref, { infoExtra });

    alert("Proveedor agregado");
    setNombre("");
    setInfoExtra("");
  };

  return (
    <form onSubmit={handleSubmit} className="container my-3">
      <h4>Agregar Proveedor</h4>
      <input
        className="form-control mb-2"
        placeholder="Nombre del proveedor (será el ID)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Información extra"
        value={infoExtra}
        onChange={(e) => setInfoExtra(e.target.value)}
      />
      <button className="btn btn-success">Agregar</button>
    </form>
  );
}
