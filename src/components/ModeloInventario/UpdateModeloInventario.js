import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import db from "../../firebase";

export default function UpdateModeloInventario() {
  const [modelos, setModelos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const snap = await getDocs(collection(db, "ModeloInventario"));
      const art = await getDocs(collection(db, "Articulos"));
      setModelos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setArticulos(art.docs.map(d => ({ id: d.id, nombre: d.data().nombreArticulo })));
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const load = async () => {
      const ref = doc(db, "ModeloInventario", selectedId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const modelo = snap.data();

      const artSnap = await getDoc(doc(db, "Articulos", modelo.codArticulo));
      const artData = artSnap.data();

      const provSnap = await getDocs(collection(db, "Articulos", modelo.codArticulo, "ProveedorArticulo"));
      const pred = provSnap.docs.find(d => d.data().esProveedorPredeterminado);
      const proveedor = pred?.data();

      if (modelo.nombreModeloInventario === "Lote Fijo") {
        if (!proveedor) return alert("No hay proveedor predeterminado");
        const d = artData.demandaArticulo;
        const cp = artData.costoPedidoArticulo;
        const ca = artData.costoAlmacenamientoArticulo;
        const demora = proveedor.DemoraEntrega;
        const lote = Math.sqrt((2 * d * cp) / ca);
        const puntoPedido = demora * (d / 30);
        modelo.loteOptimo = Math.round(lote);
        modelo.puntoPedido = Math.round(puntoPedido);
      } else if (modelo.nombreModeloInventario === "Periodo Fijo") {
        if (!proveedor) return alert("No hay proveedor predeterminado");
        const d = artData.demandaArticulo;
        const demora = proveedor.DemoraEntrega;
        const max = (d / 30) * demora + 10;
        modelo.inventarioMaximo = Math.round(max);
      }

      setData(modelo);
    };
    load();
  }, [selectedId]);

  const handleUpdate = async () => {
    await updateDoc(doc(db, "ModeloInventario", selectedId), {
      ...data,
      stockDeSeguridad: parseInt(data.stockDeSeguridad),
      loteOptimo: data.loteOptimo ? parseInt(data.loteOptimo) : undefined,
      puntoPedido: data.puntoPedido ? parseInt(data.puntoPedido) : undefined,
      inventarioMaximo: data.inventarioMaximo ? parseInt(data.inventarioMaximo) : undefined,
    });
    alert("Modelo actualizado correctamente");
  };

  return (
    <div className="container my-4">
      <h4>✏️ Editar Modelo de Inventario</h4>

      <select className="form-select mb-3" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">Seleccionar modelo</option>
        {modelos.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nombreModeloInventario} - Artículo: {articulos.find(a => a.id === m.codArticulo)?.nombre || m.codArticulo}
          </option>
        ))}
      </select>

      {data && (
        <>
          <input className="form-control mb-2" type="number" placeholder="Stock de seguridad"
            value={data.stockDeSeguridad}
            onChange={(e) => setData({ ...data, stockDeSeguridad: e.target.value })}
          />

          {data.nombreModeloInventario === "Lote Fijo" && (
            <>
              <input className="form-control mb-2" type="number" placeholder="Lote óptimo"
                value={data.loteOptimo || ""}
                readOnly
              />
              <input className="form-control mb-3" type="number" placeholder="Punto de pedido"
                value={data.puntoPedido || ""}
                readOnly
              />
            </>
          )}

          {data.nombreModeloInventario === "Periodo Fijo" && (
            <input className="form-control mb-3" type="number" placeholder="Inventario máximo"
              value={data.inventarioMaximo || ""}
              readOnly
            />
          )}

          <button className="btn btn-warning" onClick={handleUpdate}>Actualizar</button>
        </>
      )}
    </div>
  );
}
