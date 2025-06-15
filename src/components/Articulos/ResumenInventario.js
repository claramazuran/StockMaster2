import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import db from "../../firebase";

export default function ResumenInventario() {
  const [articulos, setArticulos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [proveedores, setProveedores] = useState({});
  const [nombresProveedores, setNombresProveedores] = useState({});
  const [loading, setLoading] = useState(true);
  const [tipoModelos, setTipoModelos] = useState([]);

  useEffect(() => {
    const fetchDataAndCalculate = async () => {
      const artSnap = await getDocs(collection(db, "Articulo"));
      const modeloSnap = await getDocs(collection(db, "ModeloInventario"));
      const provSnap = await getDocs(collection(db, "Proveedor"));
      const tipoModeloSnap = await getDocs(collection(db, "TipoModeloInventario"));

      setTipoModelos(tipoModeloSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((tm) => !tm.fechaHoraBajaTipoModeloInventario));

      const articulosData = artSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => !a.fechahorabaja);

      const modelosData = modeloSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))

      // FILTRAR proveedores dados de baja
      const nombres = {};
      provSnap.docs.forEach((d) => {
        if (!d.data().fechaHoraBajaProveedor) {
          nombres[d.id] = d.data().nombreProveedor || d.id;
        }
      });

      // Cargar proveedores por artículo (filtrando los dados de baja lógica)
      const provs = {};
      for (const a of artSnap.docs) {
        const sub = await getDocs(collection(db, "Articulo", a.id, "ArticuloProveedor"));
        provs[a.id] = sub.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => !p.fechaHoraBajaArticuloProveedor);
      }

      // --- Calcular y actualizar modelos en lote, con LOGS ---
      for (const a of articulosData) {
        const m = modelosData.find((m) => m.articuloId == a.id);
        const listaProv = provs[a.id] || [];
        const pred = listaProv.find(p => p.esProveedorPredeterminado);

        if (!m) {
          console.log(`No hay modelo inventario para el artículo ${a.nombreArticulo}`);
          continue;
        }

        if (!pred) {
          console.log(`No hay proveedor predeterminado para ${a.nombreArticulo}`);
          continue;
        }
      } 

      setArticulos(articulosData);
      setModelos(modelosData);
      setProveedores(provs);
      setNombresProveedores(nombres);
      setLoading(false);
    };

    fetchDataAndCalculate();
  }, []);

  const getModeloDeArticulo = (id) => modelos.find((m) => m.articuloId == id);
  
  const getTipoModelo = (id) => tipoModelos.find((tm) => tm.id === id);

  const tieneOrdenPendiente = (articuloId) => false; // placeholder

  const calcularCGI = (a, m, tm) => {
    if (!a || !m || !tm ||tm.nombre !== "Modelo de Lote Fijo" || !m.loteOptimo) return null;
    const { demandaArticulo, costoPedidoArticulo, costoAlmacenamientoArticulo } = a;
    const lote = m.loteOptimo;
    const cgi = (costoPedidoArticulo * demandaArticulo) / lote + (lote / 2) * costoAlmacenamientoArticulo;
    return cgi.toFixed(2);
  };

  const getRowClass = (a, m) => {
    if (!m) return "";
    if (a.stockActualArticulo <= m.puntoPedido && !tieneOrdenPendiente(a.id)) return "table-danger";
    if (a.stockActualArticulo <= m.stockSeguridad) return "table-warning";
    return "";
  };

  if (loading) return <div className="text-center my-5">Cargando inventario...</div>;

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
              <th>Stock Seguridad</th>
              <th>CGI</th>
              <th>Periodo Revision en Dias</th>
              <th>Proveedores</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a) => {
              const m = getModeloDeArticulo(a.id);
              const tm = getTipoModelo(m?.tipoModeloId);
              if (!m) return null;
              const rowClass = getRowClass(a, m);
              const listaProv = proveedores[a.id] || [];

              let estado;

              if (a.stockActualArticulo <= (m?.stockSeguridad ?? 0)) {
                estado = "🟠 Faltante";
              } else if (
                a.stockActualArticulo == (m?.puntoPedido ?? 0)
                && !tieneOrdenPendiente(a.id)
              ) {
                estado = "🔴 Reponer";
              } else {
                estado = "✅ OK";
              }
              return (
                <tr key={a.id} className={rowClass}>
                  <td>{a.nombreArticulo}</td>
                  <td>{a.stockActualArticulo}</td>
                  <td>{a.demandaArticulo}</td>
                  <td>{tm?.nombre || "-"}</td>
                  <td>{m?.cantidadAPedirOptima ?? "-"}</td>
                  <td>{m?.puntoPedido ?? "-"}</td>
                  <td>{m?.stockSeguridad ?? "-"}</td>
                  <td>{calcularCGI(a, m, tm) ?? "-"}</td>
                  <td>{m?.periodoRevision ?? "-"}</td>
                  <td>
                    {listaProv.length > 0
                      ? listaProv.map((p, i) => (
                          <div key={i}>
                            {nombresProveedores[p.codProveedor] || p.codProveedor} ({p.precioUnitario}) {p.esProveedorPredeterminado ? "⭐" : ""}
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
