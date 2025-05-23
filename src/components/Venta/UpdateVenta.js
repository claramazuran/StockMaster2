import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import db from "../../firebase";

export default function UpdateVenta() {
  const [ventas, setVentas] = useState([]);
  const [selectedVentaId, setSelectedVentaId] = useState("");
  const [items, setItems] = useState([]);
  const [articulos, setArticulos] = useState([]);

  useEffect(() => {
    const fetchVentasYArticulos = async () => {
      const ventaSnap = await getDocs(collection(db, "Venta"));
      setVentas(ventaSnap.docs.map(d => ({ id: d.id })));

      const artSnap = await getDocs(collection(db, "Articulos"));
      setArticulos(artSnap.docs.map(d => ({
        id: d.id,
        descripcion: d.data().descripcionArticulo,
      })));
    };
    fetchVentasYArticulos();
  }, []);

  useEffect(() => {
    if (!selectedVentaId) return;

    const fetchDetalle = async () => {
      const snap = await getDocs(collection(db, "Venta", selectedVentaId, "DetalleVenta"));
      const lista = snap.docs.map(d => ({
        codArticulo: d.id,
        ...d.data(),
      }));
      setItems(lista);
    };
    fetchDetalle();
  }, [selectedVentaId]);

  const handleItemChange = (index, campo, valor) => {
    const nuevo = [...items];
    nuevo[index][campo] = valor;
    setItems(nuevo);
  };

  const precioTotal = items.reduce((acc, item) => {
    const precio = parseFloat(item.precioVentaArticulo || 0);
    const cantidad = parseInt(item.cantidadVendidaArticulo || 0);
    return acc + precio * cantidad;
  }, 0);

  const handleGuardarCambios = async () => {
    await updateDoc(doc(db, "Venta", selectedVentaId), {
      precioTotalVenta: precioTotal,
    });

    for (const item of items) {
      const ref = doc(db, "Venta", selectedVentaId, "DetalleVenta", item.codArticulo);
      await setDoc(ref, {
        codArticulo: item.codArticulo,
        precioVentaArticulo: parseFloat(item.precioVentaArticulo),
        cantidadVendidaArticulo: parseInt(item.cantidadVendidaArticulo),
        precioTotalVenta: parseFloat(item.precioVentaArticulo) * parseInt(item.cantidadVendidaArticulo),
      });
    }

    alert("Venta actualizada correctamente");
  };

  return (
    <div className="container my-4">
      <h4>✏️ Actualizar Venta</h4>

      <select
        className="form-select mb-3"
        value={selectedVentaId}
        onChange={(e) => setSelectedVentaId(e.target.value)}
      >
        <option value="">Seleccionar venta</option>
        {ventas.map((v) => (
          <option key={v.id} value={v.id}>Venta #{v.id}</option>
        ))}
      </select>

      {items.map((item, i) => (
        <div key={i} className="card mb-3 p-3">
          <select
            className="form-select mb-2"
            value={item.codArticulo}
            disabled
          >
            <option>{articulos.find(a => a.id === item.codArticulo)?.descripcion || item.codArticulo}</option>
          </select>
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Precio unitario"
            value={item.precioVentaArticulo}
            onChange={(e) => handleItemChange(i, "precioVentaArticulo", e.target.value)}
          />
          <input
            type="number"
            className="form-control"
            placeholder="Cantidad"
            value={item.cantidadVendidaArticulo}
            onChange={(e) => handleItemChange(i, "cantidadVendidaArticulo", e.target.value)}
          />
        </div>
      ))}

      <div className="alert alert-info">
        <strong>Total actualizado:</strong> ${precioTotal.toFixed(2)}
      </div>

      {selectedVentaId && (
        <button className="btn btn-warning" onClick={handleGuardarCambios}>
          Guardar Cambios
        </button>
      )}
    </div>
  );
}
