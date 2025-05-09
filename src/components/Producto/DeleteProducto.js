// src/components/Producto/DeleteProducto.js
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import db from "../../firebase";

export default function DeleteProducto() {
  const [nombre, setNombre] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    const ref = doc(db, "Productos", nombre);
    await deleteDoc(ref);

    alert("Producto eliminado");
    setNombre("");
  };

  return (
    <form onSubmit={handleDelete} className="container my-3">
      <h4>Eliminar Producto</h4>
      <input
        className="form-control mb-2"
        placeholder="Nombre del producto (ID)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button className="btn btn-danger">Eliminar</button>
    </form>
  );
}
