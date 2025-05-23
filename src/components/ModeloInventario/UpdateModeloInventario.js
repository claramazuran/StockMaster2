import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../../firebase/config";

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
      setArticulos(art.docs.map(d => ({ id: d.id, descripcion: d.data().descripcionArticulo })));
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const load = async () => {
      const ref = doc(db, "ModeloInventario", selectedId);
      const snap = await getDoc(ref);
      if (snap.exists()) setData(snap.data());
    };
    load();
  }, [selectedId]);

  const handleChange = (campo, valor) => {
    setData({ ...data, [campo]: valor });
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, "ModeloInventario", selectedId), {
      ...data,
      stockDeSeguridad: parseInt(data.stockDeSeguridad),
      loteOptimo: data.loteOptimo ? parseInt(data.loteOptimo) : undefined,
      puntoPedido: data.puntoPedido ? parseInt(data.puntoPedido) : undefined,
      inventarioMaximo: data.inventarioMaximo ? parseInt(data.inventarioMaximo) : undefined,
    });
    alert("Modelo actualizado");
  };

  return (
    <div className="container my-4">
      <h4>✏️ Editar Modelo de Inventario</h4>

      <select className="form-select mb-3" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">Seleccionar modelo</option>
        {modelos.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nombreModeloInventario} - Artículo: {articulos.find(a => a.id === m.codArticulo)?.descripcion || m.codArticulo}
          </option>
        ))}
      </select>

      {data && (
        <>
          <input className="form-control mb-2" type="number" placeholder="Stock de seguridad"
            value={data.stockDeSeguridad}
            onChange={(e) => handleChange("stockDeSeguridad", e.target.value)}
          />

          {data.nombreModeloInventario === "Lote Fijo" && (
            <>
              <input className="form-control mb-2" type="number" placeholder="Lote óptimo"
                value={data.loteOptimo || ""}
                onChange={(e) => handleChange("loteOptimo", e.target.value)}
              />
              <input className="form-control mb-3" type="number" placeholder="Punto de pedido"
                value={data.puntoPedido || ""}
                onChange={(e) => handleChange("puntoPedido", e.target.value)}
              />
            </>
          )}

          {data.nombreModeloInventario === "Inventario Fijo" && (
            <input className="form-control mb-3" type="number" placeholder="Inventario máximo"
              value={data.inventarioMaximo || ""}
              onChange={(e) => handleChange("inventarioMaximo", e.target.value)}
            />
          )}

          <button className="btn btn-warning" onClick={handleUpdate}>Actualizar</button>
        </>
      )}
    </div>
  );
}
