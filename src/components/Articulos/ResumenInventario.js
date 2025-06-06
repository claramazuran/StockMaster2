import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import db from "../../firebase";

export default function ResumenInventario() {
  const [articulos, setArticulos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [proveedores, setProveedores] = useState({});
  const [nombresProveedores, setNombresProveedores] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const artSnap = await getDocs(collection(db, "Articulos"));
      const modeloSnap = await getDocs(collection(db, "ModeloInventario"));
      const provSnap = await getDocs(collection(db, "Proveedor"));

      const articulosData = artSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const modelosData = modeloSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const nombres = {};
      provSnap.docs.forEach((d) => {
        nombres[d.id] = d.data().nombreProveedor || d.id;
      });

      const provs = {};
      for (const a of artSnap.docs) {
        const sub = await getDocs(collection(db, "Articulos", a.id, "ProveedorArticulo"));
        provs[a.id] = sub.docs.map(d => d.data());
      }

      setArticulos(articulosData);
      setModelos(modelosData);
      setProveedores(provs);
      setNombresProveedores(nombres);
    };

    fetchData();
  }, []);

  const getModeloDeArticulo = (id) => modelos.find((m) => m.codArticulo === id);

  const calcularCGI = (a, m) => {
    if (!a || !m || m.nombreModeloInventario !== "Lote Fijo" || !m.loteOptimo) return null;
    const { demandaArticulo, costoPedidoArticulo, costoAlmacenamientoArticulo } = a;
    const lote = m.loteOptimo;
    const cgi = (costoPedidoArticulo * demandaArticulo) / lote + (lote / 2) * costoAlmacenamientoArticulo;
    return cgi.toFixed(2);
  };

  const tieneOrdenPendiente = (articuloId) => false;

  const getRowClass = (a, m) => {
    if (!m) return "";
    if (a.stockActualArticulo <= m.puntoPedido && !tieneOrdenPendiente(a.id)) return "table-danger";
    if (a.stockActualArticulo <= m.stockDeSeguridad) return "table-warning";
    return "";
  };

  return (
    <div className="container my-4">
      <h4>📊 Resumen de Artículos e Inventario</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Artículo</th>
              <th>Stock</th>
              <th>Demanda</th>
              <th>Modelo</th>
              <th>Lote óptimo</th>
              <th>Punto pedido</th>
              <th>Inventario máx</th>
              <th>Stock Seguridad</th>
              <th>CGI</th>
              <th>Proveedores</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a) => {
              const m = getModeloDeArticulo(a.id);
              const rowClass = getRowClass(a, m);
              const listaProv = proveedores[a.id] || [];
              const estado = a.stockActualArticulo <= (m?.puntoPedido ?? 0) && !tieneOrdenPendiente(a.id)
                ? "🔴 Reponer"
                : a.stockActualArticulo <= (m?.stockDeSeguridad ?? 0)
                ? "🟠 Faltante"
                : "✅ OK";

              return (
                <tr key={a.id} className={rowClass}>
                  <td>{a.nombreArticulo}</td>
                  <td>{a.stockActualArticulo}</td>
                  <td>{a.demandaArticulo}</td>
                  <td>{m?.nombreModeloInventario || "-"}</td>
                  <td>{m?.loteOptimo ?? "-"}</td>
                  <td>{m?.puntoPedido ?? "-"}</td>
                  <td>{m?.inventarioMaximo ?? "-"}</td>
                  <td>{m?.stockDeSeguridad ?? "-"}</td>
                  <td>{calcularCGI(a, m) ?? "-"}</td>
                  <td>
                    {listaProv.length > 0
                      ? listaProv.map((p, i) => (
                          <div key={i}>
                            {nombresProveedores[p.codProveedor] || p.codProveedor} ({p.PrecioUnitario}) {p.esProveedorPredeterminado ? "⭐" : ""}
                          </div>
                        ))
                      : "-"}
                  </td>
                  <td>{estado}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
