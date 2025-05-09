import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import db from "../../firebase";

export default function UpdateProducto() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const ref = doc(db, "Productos", nombre);
    await updateDoc(ref, {
      descripcion,
    });

    alert("Producto actualizado");
    setNombre("");
    setDescripcion("");
  };

  return (
    <form onSubmit={handleUpdate} className="container my-3">
      <h4>Actualizar Producto</h4>
      <input
        className="form-control mb-2"
        placeholder="Nombre del producto (ID)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        className="form-control mb-2"
        placeholder="Nueva descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <button className="btn btn-warning">Actualizar</button>
    </form>
  );
}
