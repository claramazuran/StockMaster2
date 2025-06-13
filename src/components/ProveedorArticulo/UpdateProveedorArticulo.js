import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../../firebase";

export default function UpdateProveedorArticulo() {
  const [articulos, setArticulos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [articuloId, setArticuloId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [data, setData] = useState(null);
  const [bajaRelacion, setBajaRelacion] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      // Artículos activos
      const artSnap = await getDocs(collection(db, "Articulos"));
      setArticulos(
        artSnap.docs
          .map(d => ({
            id: d.id,
            nombre: d.data().nombreArticulo,
            baja: d.data().fechahorabaja || null,
          }))
          .filter(a => !a.baja)
      );
      // Proveedores activos
      const provSnap = await getDocs(collection(db, "Proveedor"));
      setProveedores(
        provSnap.docs
          .map(d => ({
            id: d.id,
            nombre: d.data().nombreProveedor,
            baja: d.data().fechaHoraBajaProveedor || null,
          }))
          .filter(p => !p.baja)
      );
    };
    fetch();
  }, []);

  useEffect(() => {
    const load = async () => {
      setData(null);
      setBajaRelacion(false);
      if (!articuloId || !proveedorId) return;
      const ref = doc(db, "Articulos", articuloId, "ProveedorArticulo", proveedorId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        if (d.fechaHoraBajaProveedorArticulo) {
          setBajaRelacion(true);
          setData(null);
        } else {
          setBajaRelacion(false);
          setData({
            ...d,
            desviacionEstandar: d.desviacionEstandar !== undefined ? d.desviacionEstandar : 1,
            periodoRevision: d.periodoRevision !== undefined ? d.periodoRevision : 7
          });
        }
      }
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
      desviacionEstandar: parseFloat(data.desviacionEstandar),
      periodoRevision: parseInt(data.periodoRevision)
    });
    alert("Actualizado correctamente");
  };

  return (
    <div className="container my-4">
      <h4>Actualizar Proveedor-Artículo</h4>

      <select className="form-select mb-2" value={articuloId} onChange={(e) => setArticuloId(e.target.value)}>
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.nombre}</option>
        ))}
      </select>

      <select className="form-select mb-2" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
        <option value="">Seleccionar proveedor</option>
        {proveedores.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>

      {/* Si relación dada de baja lógica */}
      {bajaRelacion && (
        <div className="alert alert-danger mt-3">
          Esta relación proveedor-artículo fue dada de baja y no puede ser editada.
        </div>
      )}

      {data && !bajaRelacion && (
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
          {/* Nuevo campo: Desviación estándar */}
          <input
            className="form-control mb-2"
            type="number"
            step="any"
            value={data.desviacionEstandar}
            onChange={(e) => setData({ ...data, desviacionEstandar: e.target.value })}
            placeholder="Desviación estándar de la demanda"
          />
          {/* Nuevo campo: Período de revisión */}
          <input
            className="form-control mb-2"
            type="number"
            value={data.periodoRevision}
            onChange={(e) => setData({ ...data, periodoRevision: e.target.value })}
            placeholder="Período de revisión (días)"
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
