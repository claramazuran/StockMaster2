import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../../firebase";

export default function UpdateProveedorArticulo() {
  const [articulos, setArticulos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [articuloId, setArticuloId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const artSnap = await getDocs(collection(db, "Articulos"));
      const provSnap = await getDocs(collection(db, "Proveedor"));
      setArticulos(artSnap.docs.map(d => ({ id: d.id, descripcion: d.data().descripcionArticulo })));
      setProveedores(provSnap.docs.map(d => ({ id: d.id, nombre: d.data().nombreProveedor })));
    };
    fetch();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!articuloId || !proveedorId) return;
      const ref = doc(db, "Articulos", articuloId, "ProveedorArticulo", proveedorId);
      const snap = await getDoc(ref);
      if (snap.exists()) setData(snap.data());
    };
    load();
  }, [articuloId, proveedorId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const ref = doc(db, "Articulos", articuloId, "ProveedorArticulo", proveedorId);
    await updateDoc(ref, {
      CargosPedido: parseInt(data.CargosPedido),
      DemoraEntrega: parseInt(data.DemoraEntrega),
      PrecioUnitario: parseFloat(data.PrecioUnitario),
      esProveedorPredeterminado: data.esProveedorPredeterminado,
    });
    alert("Actualizado correctamente");
  };

  return (
    <div className="container my-4">
      <h4>Actualizar Proveedor-Artículo</h4>

      <select className="form-select mb-2" value={articuloId} onChange={(e) => setArticuloId(e.target.value)}>
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.descripcion}</option>
        ))}
      </select>

      <select className="form-select mb-2" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      {data && (
        <form onSubmit={handleUpdate}>
          <input
            className="form-control mb-2"
            type="number"
            value={data.CargosPedido}
            onChange={(e) => setData({ ...data, CargosPedido: e.target.value })}
            placeholder="Cargos de pedido"
          />
          <input
            className="form-control mb-2"
            type="number"
            value={data.DemoraEntrega}
            onChange={(e) => setData({ ...data, DemoraEntrega: e.target.value })}
            placeholder="Demora en días"
          />
          <input
            className="form-control mb-2"
            type="number"
            value={data.PrecioUnitario}
            onChange={(e) => setData({ ...data, PrecioUnitario: e.target.value })}
            placeholder="Precio unitario"
          />
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="checkPredeterminado"
              checked={data.esProveedorPredeterminado}
              onChange={(e) =>
                setData({ ...data, esProveedorPredeterminado: e.target.checked })
              }
            />
            <label className="form-check-label" htmlFor="checkPredeterminado">
              Proveedor Predeterminado
            </label>
          </div>
          <button className="btn btn-warning">Actualizar</button>
        </form>
      )}
    </div>
  );
}
