import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import db from "../../firebase";

export default function VerProductoProveedor() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, "Productos"));
      const lista = snapshot.docs.map((doc) => doc.id);
      setProductos(lista);
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchTipos = async () => {
      if (!productoSeleccionado) return;
      const ref = collection(db, "Productos", productoSeleccionado, "productoProveedor");
      const snapshot = await getDocs(ref);
      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTipos(lista);
    };
    fetchTipos();
  }, [productoSeleccionado]);

  const actualizarStock = async (tipoId, cantidad) => {
    const ref = doc(db, "Productos", productoSeleccionado, "productoProveedor", tipoId);
    const tipoActual = tipos.find((t) => t.id === tipoId);
    const nuevoStock = tipoActual.stock + cantidad;

    if (nuevoStock < 0) return alert("No puede ser menor a 0");

    await updateDoc(ref, { stock: nuevoStock });

    // Actualizar estado local
    setTipos((prev) =>
      prev.map((t) =>
        t.id === tipoId ? { ...t, stock: nuevoStock } : t
      )
    );
  };

  return (
    <div className="container my-4">
      <h4>📦 Ver tipos de producto y modificar stock</h4>

      <select
        className="form-select mb-4"
        value={productoSeleccionado}
        onChange={(e) => setProductoSeleccionado(e.target.value)}
      >
        <option value="">Seleccionar producto</option>
        {productos.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="row">
        {tipos.map((tipo) => (
          <div className="col-md-4" key={tipo.id}>
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">{tipo.id}</h5>
                <p className="card-text">
                  <strong>Precio:</strong> ${tipo.precio}<br />
                  <strong>Stock:</strong> {tipo.stock}<br />
                  <strong>Proveedor:</strong> {tipo.proveedorId}
                </p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => actualizarStock(tipo.id, -1)}
                  >
                    ➖
                  </button>
                  <button
                    className="btn btn-outline-success"
                    onClick={() => actualizarStock(tipo.id, 1)}
                  >
                    ➕
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
