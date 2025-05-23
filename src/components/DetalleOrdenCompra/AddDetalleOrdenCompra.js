import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import db from "../../firebase";

export default function AddDetalleOrdenCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [selectedOrdenId, setSelectedOrdenId] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const ordenSnap = await getDocs(collection(db, "OrdenCompra"));
      setOrdenes(ordenSnap.docs.map((doc) => ({ id: doc.id })));

      const artSnap = await getDocs(collection(db, "Articulos"));
      setArticulosDisponibles(
        artSnap.docs.map((d) => ({
          id: d.id,
          descripcion: d.data().descripcionArticulo,
        }))
      );
    };
    fetchData();
  }, []);

  const handleAgregarItem = () => {
    setItems([...items, { codArticulo: "", precioArticulo: "", cantidad: "" }]);
  };

  const handleEliminarItem = (index) => {
    const nuevo = [...items];
    nuevo.splice(index, 1);
    setItems(nuevo);
  };

  const handleItemChange = (index, campo, valor) => {
    const nuevo = [...items];
    nuevo[index][campo] = valor;
    setItems(nuevo);
  };

  const handleGuardarDetalle = async () => {
    if (!selectedOrdenId || items.length === 0) return alert("Seleccioná orden y al menos un artículo");

    const fecha = new Date();
    const precioTotal = items.reduce(
      (total, item) => total + parseFloat(item.precioArticulo || 0) * parseInt(item.cantidad || 0),
      0
    );

    // 1. Crear documento en DetalleOrdenCompra
    const detalleRef = await addDoc(
      collection(db, "OrdenCompra", selectedOrdenId, "DetalleOrdenCompra"),
      {
        fechaHoraAlta: fecha,
        fechaHoraBaja: null,
        precioTotal,
      }
    );

    // 2. Cargar artículos
    const articulosRef = collection(db, "OrdenCompra", selectedOrdenId, "DetalleOrdenCompra", detalleRef.id, "articulos");

    for (const item of items) {
      await setDoc(doc(articulosRef, item.codArticulo), {
        codArticulo: item.codArticulo,
        precioArticulo: parseFloat(item.precioArticulo),
        cantidad: parseInt(item.cantidad),
      });
    }

    alert("Detalle de orden guardado");
    setItems([]);
    setSelectedOrdenId("");
  };

  return (
    <div className="container my-4">
      <h4>➕ Agregar Detalle de Orden de Compra</h4>

      <select
        className="form-select mb-3"
        value={selectedOrdenId}
        onChange={(e) => setSelectedOrdenId(e.target.value)}
      >
        <option value="">Seleccionar orden</option>
        {ordenes.map((o) => (
          <option key={o.id} value={o.id}>
            Orden #{o.id}
          </option>
        ))}
      </select>

      <button className="btn btn-outline-primary mb-3" onClick={handleAgregarItem}>
        ➕ Agregar artículo
      </button>

      {items.map((item, i) => (
        <div key={i} className="card mb-3 p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <select
                className="form-select"
                value={item.codArticulo}
                onChange={(e) => handleItemChange(i, "codArticulo", e.target.value)}
              >
                <option value="">Seleccionar artículo</option>
                {articulosDisponibles.map((a) => (
                  <option key={a.id} value={a.id}>{a.descripcion}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Precio"
                value={item.precioArticulo}
                onChange={(e) => handleItemChange(i, "precioArticulo", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={item.cantidad}
                onChange={(e) => handleItemChange(i, "cantidad", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-danger w-100" onClick={() => handleEliminarItem(i)}>
                ➖
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="btn btn-success" onClick={handleGuardarDetalle}>
        Guardar Detalle
      </button>
    </div>
  );
}
