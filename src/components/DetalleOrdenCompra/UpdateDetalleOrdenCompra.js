import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import db from "../../firebase/config";

export default function UpdateDetalleOrdenCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [ordenId, setOrdenId] = useState("");
  const [detalleId, setDetalleId] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchOrdenesYArticulos = async () => {
      const snap = await getDocs(collection(db, "OrdenCompra"));
      const art = await getDocs(collection(db, "Articulos"));
      setOrdenes(snap.docs.map((d) => ({ id: d.id })));
      setArticulosDisponibles(
        art.docs.map((d) => ({
          id: d.id,
          descripcion: d.data().descripcionArticulo,
        }))
      );
    };
    fetchOrdenesYArticulos();
  }, []);

  useEffect(() => {
    if (!ordenId) return;
    const fetchDetalles = async () => {
      const snap = await getDocs(collection(db, "OrdenCompra", ordenId, "DetalleOrdenCompra"));
      setDetalles(snap.docs.map(d => ({ id: d.id })));
    };
    fetchDetalles();
  }, [ordenId]);

  useEffect(() => {
    if (!ordenId || !detalleId) return;
    const fetchItems = async () => {
      const snap = await getDocs(collection(db, "OrdenCompra", ordenId, "DetalleOrdenCompra", detalleId, "articulos"));
      const lista = snap.docs.map(d => ({
        codArticulo: d.id,
        ...d.data()
      }));
      setItems(lista);
    };
    fetchItems();
  }, [detalleId]);

  const handleItemChange = (index, campo, valor) => {
    const nuevo = [...items];
    nuevo[index][campo] = valor;
    setItems(nuevo);
  };

  const handleGuardarCambios = async () => {
    const nuevoTotal = items.reduce((total, item) =>
      total + parseFloat(item.precioArticulo || 0) * parseInt(item.cantidad || 0), 0
    );

    await updateDoc(doc(db, "OrdenCompra", ordenId, "DetalleOrdenCompra", detalleId), {
      precioTotal: nuevoTotal,
    });

    for (const item of items) {
      const ref = doc(db, "OrdenCompra", ordenId, "DetalleOrdenCompra", detalleId, "articulos", item.codArticulo);
      await setDoc(ref, {
        codArticulo: item.codArticulo,
        precioArticulo: parseFloat(item.precioArticulo),
        cantidad: parseInt(item.cantidad),
      });
    }

    alert("Detalle actualizado correctamente");
  };

  const precioTotal = items.reduce((acc, item) => {
    const precio = parseFloat(item.precioArticulo || 0);
    const cantidad = parseInt(item.cantidad || 0);
    return acc + (precio * cantidad);
  }, 0);

  return (
    <div className="container my-4">
      <h4>✏️ Actualizar Detalle de Orden</h4>

      <select className="form-select mb-3" value={ordenId} onChange={(e) => setOrdenId(e.target.value)}>
        <option value="">Seleccionar orden</option>
        {ordenes.map((o) => (
          <option key={o.id} value={o.id}>Orden #{o.id}</option>
        ))}
      </select>

      {ordenId && (
        <select className="form-select mb-3" value={detalleId} onChange={(e) => setDetalleId(e.target.value)}>
          <option value="">Seleccionar detalle</option>
          {detalles.map(d => (
            <option key={d.id} value={d.id}>Detalle #{d.id}</option>
          ))}
        </select>
      )}

      {items.map((item, i) => (
        <div className="card mb-2 p-3" key={i}>
          <select
            className="form-select mb-2"
            value={item.codArticulo}
            onChange={(e) => handleItemChange(i, "codArticulo", e.target.value)}
          >
            <option value="">Artículo</option>
            {articulosDisponibles.map((a) => (
              <option key={a.id} value={a.id}>{a.descripcion}</option>
            ))}
          </select>
          <input
            className="form-control mb-2"
            type="number"
            value={item.precioArticulo}
            placeholder="Precio"
            onChange={(e) => handleItemChange(i, "precioArticulo", e.target.value)}
          />
          <input
            className="form-control"
            type="number"
            value={item.cantidad}
            placeholder="Cantidad"
            onChange={(e) => handleItemChange(i, "cantidad", e.target.value)}
          />
        </div>
      ))}

      <div className="alert alert-info mt-3">
        <strong>Precio total estimado:</strong> ${precioTotal.toFixed(2)}
      </div>

      {detalleId && (
        <button className="btn btn-warning" onClick={handleGuardarCambios}>
          Guardar Cambios
        </button>
      )}
    </div>
  );
}
