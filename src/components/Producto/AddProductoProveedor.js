import { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddProductoProveedor() {
  const [productoId, setProductoId] = useState("");
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [proveedores, setProveedores] = useState([]);

  // Traer proveedores
  useEffect(() => {
    const fetchProveedores = async () => {
      const snapshot = await getDocs(collection(db, "proveedor"));
      const lista = snapshot.docs.map(doc => doc.id);
      setProveedores(lista);
    };
    fetchProveedores();
  }, []);

  // Traer productos
  useEffect(() => {
    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, "Productos"));
      const lista = snapshot.docs.map(doc => doc.id);
      setProductos(lista);
    };
    fetchProductos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productoId || !nombre || !proveedorId) return alert("Todos los campos son requeridos");

    const ref = doc(db, "Productos", productoId, "productoProveedor", nombre);
    await setDoc(ref, {
      precio: parseFloat(precio),
      stock: parseInt(stock),
      proveedorId,
    });

    alert("Tipo de producto agregado");
    setNombre("");
    setPrecio("");
    setStock("");
  };

  return (
    <form onSubmit={handleSubmit} className="container my-3">
      <h4>Agregar tipo de producto a un proveedor</h4>

      <select
        className="form-select mb-3"
        value={productoId}
        onChange={(e) => setProductoId(e.target.value)}
      >
        <option value="">Seleccionar producto</option>
        {productos.map((prod) => (
          <option key={prod} value={prod}>{prod}</option>
        ))}
      </select>

      <input
        className="form-control mb-2"
        placeholder="Nombre del tipo (ej: lata)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="number"
        className="form-control mb-2"
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />
      <input
        type="number"
        className="form-control mb-2"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <select
        className="form-select mb-3"
        value={proveedorId}
        onChange={(e) => setProveedorId(e.target.value)}
      >
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((prov) => (
          <option key={prov} value={prov}>{prov}</option>
        ))}
      </select>
      <button className="btn btn-success">Agregar</button>
    </form>
  );
}
