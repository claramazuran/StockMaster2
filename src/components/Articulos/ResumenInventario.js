import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import db from "../../firebase";

export default function ResumenInventario() {
  const [articulos, setArticulos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [proveedores, setProveedores] = useState({});
  const [nombresProveedores, setNombresProveedores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataAndCalculate = async () => {
      const artSnap = await getDocs(collection(db, "Articulos"));
      const modeloSnap = await getDocs(collection(db, "ModeloInventario"));
      const provSnap = await getDocs(collection(db, "Proveedor"));

      const articulosData = artSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const modelosData = modeloSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const nombres = {};
      provSnap.docs.forEach((d) => {
        nombres[d.id] = d.data().nombreProveedor || d.id;
      });

      // Cargar proveedores por artículo
      const provs = {};
      for (const a of artSnap.docs) {
        const sub = await getDocs(collection(db, "Articulos", a.id, "ProveedorArticulo"));
        provs[a.id] = sub.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // --- Calcular y actualizar modelos en lote, con LOGS ---
      for (const a of articulosData) {
        const m = modelosData.find((m) => m.codArticulo === a.id);
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

        if (m.nombreModeloInventario === "Lote Fijo") {
          const d = a.demandaArticulo;
          const cp = a.costoPedidoArticulo;
          const ca = a.costoAlmacenamientoArticulo;
          const demora = pred.DemoraEntrega ?? 0;

          const lote = Math.sqrt((2 * d * cp) / ca);
          const punto = demora * (d / 30);

          const loteOptimo = Math.round(lote);
          const puntoPedido = Math.round(punto);

          console.log(`Artículo: ${a.nombreArticulo}`);
          console.log(`   Lote óptimo actual: ${m.loteOptimo}, Calculado: ${loteOptimo}`);
          console.log(`   Punto pedido actual: ${m.puntoPedido}, Calculado: ${puntoPedido}`);
          console.log(`   Datos usados - demanda: ${d}, costo pedido: ${cp}, costo almacenamiento: ${ca}, demora: ${demora}`);

          if (m.loteOptimo !== loteOptimo || m.puntoPedido !== puntoPedido) {
            try {
              await updateDoc(doc(db, "ModeloInventario", m.id), {
                loteOptimo,
                puntoPedido
              });
              m.loteOptimo = loteOptimo;
              m.puntoPedido = puntoPedido;
              console.log(`   Actualizado en Firestore! loteOptimo: ${loteOptimo}, puntoPedido: ${puntoPedido}`);
            } catch (e) {
              console.error(`Error actualizando modelo para ${a.nombreArticulo}:`, e);
            }
          } else {
            console.log("   No se requiere actualización, valores iguales.");
          }
        }
        // Inventario Fijo
        else if (m.nombreModeloInventario === "Inventario Fijo") {
          const max = Math.round((a.demandaArticulo / 30) * (pred.DemoraEntrega ?? 0) + 10);
          console.log(`Inventario Máximo actual: ${m.inventarioMaximo}, Calculado: ${max}`);
          if (m.inventarioMaximo !== max) {
            try {
              await updateDoc(doc(db, "ModeloInventario", m.id), {
                inventarioMaximo: max
              });
              m.inventarioMaximo = max;
              console.log(`   Actualizado inventarioMaximo: ${max}`);
            } catch (e) {
              console.error(`Error actualizando inventarioMaximo para ${a.nombreArticulo}:`, e);
            }
          } else {
            console.log("   No se requiere actualización de inventario máximo, valores iguales.");
          }
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

  const getModeloDeArticulo = (id) => modelos.find((m) => m.codArticulo === id);

  const tieneOrdenPendiente = (articuloId) => false; // placeholder

  const calcularCGI = (a, m) => {
    if (!a || !m || m.nombreModeloInventario !== "Lote Fijo" || !m.loteOptimo) return null;
    const { demandaArticulo, costoPedidoArticulo, costoAlmacenamientoArticulo } = a;
    const lote = m.loteOptimo;
    const cgi = (costoPedidoArticulo * demandaArticulo) / lote + (lote / 2) * costoAlmacenamientoArticulo;
    return cgi.toFixed(2);
  };

  const getRowClass = (a, m) => {
    if (!m) return "";
    if (a.stockActualArticulo <= m.puntoPedido && !tieneOrdenPendiente(a.id)) return "table-danger";
    if (a.stockActualArticulo <= m.stockDeSeguridad) return "table-warning";
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
              if (!m) return null;
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
