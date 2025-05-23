import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddVenta() {
  const [articulos, setArticulos] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchArticulos = async () => {
      const snap = await getDocs(collection(db, "Articulos"));
      setArticulos(snap.docs.map(d => ({
        id: d.id,
        nombre: d.data().nombreArticulo
      })));
    };
    fetchArticulos();
  }, []);

  const handleAgregarItem = () => {
    setItems([...items, { codArticulo: "", precioVentaArticulo: "", cantidadVendidaArticulo: "" }]);
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

  const precioTotalVenta = items.reduce((acc, item) => {
    const precio = parseFloat(item.precioVentaArticulo || 0);
    const cantidad = parseInt(item.cantidadVendidaArticulo || 0);
    return acc + (precio * cantidad);
  }, 0);

  const handleGuardarVenta = async () => {
    if (items.length === 0) return alert("Agregá al menos un artículo");

    const fecha = new Date();

    const ventaRef = await addDoc(collection(db, "Venta"), {
      fechaHoraVenta: fecha,
      precioTotalVenta: precioTotalVenta
    });

    const detalleRef = collection(db, "Venta", ventaRef.id, "DetalleVenta");

    for (const item of items) {
      await setDoc(doc(detalleRef, item.codArticulo), {
        codArticulo: item.codArticulo,
        precioVentaArticulo: parseFloat(item.precioVentaArticulo),
        cantidadVendidaArticulo: parseInt(item.cantidadVendidaArticulo),
        precioTotalVenta: parseFloat(item.precioVentaArticulo) * parseInt(item.cantidadVendidaArticulo)
      });
    }

    alert("Venta registrada exitosamente");
    setItems([]);
  };

  return (
    <div className="container my-4">
      <h4>➕ Registrar Venta</h4>

      <button className="btn btn-outline-primary mb-3" onClick={handleAgregarItem}>
        ➕ Agregar Artículo
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
                {articulos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Precio unitario"
                value={item.precioVentaArticulo}
                onChange={(e) => handleItemChange(i, "precioVentaArticulo", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={item.cantidadVendidaArticulo}
                onChange={(e) => handleItemChange(i, "cantidadVendidaArticulo", e.target.value)}
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

      <div className="alert alert-info mt-3">
        <strong>Total de la venta:</strong> ${precioTotalVenta.toFixed(2)}
      </div>

      <button className="btn btn-success" onClick={handleGuardarVenta}>
        Registrar Venta
      </button>
    </div>
  );
}
