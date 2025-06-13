import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import db from "../../firebase";

export default function TablaOrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState({});
  const [articulos, setArticulos] = useState({});
  const [filtro, setFiltro] = useState("");
  const [ordenAsc, setOrdenAsc] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [provSnap, artSnap, ordenSnap] = await Promise.all([
        getDocs(collection(db, "Proveedor")),
        getDocs(collection(db, "Articulos")),
        getDocs(collection(db, "OrdenCompra")),
      ]);

      // Proveedores activos
      const provMap = {};
      provSnap.docs.forEach((d) => {
        if (!d.data().fechaHoraBajaProveedor) {
          provMap[d.id] = d.data().nombreProveedor;
        }
      });
      setProveedores(provMap);

      // Artículos activos
      const artMap = {};
      artSnap.docs.forEach((d) => {
        if (!d.data().fechahorabaja) {
          artMap[d.id] = d.data().nombreArticulo;
        }
      });
      setArticulos(artMap);

      // Órdenes de compra activas y cuyos proveedores/artículos estén activos
      const ordenesConDatos = await Promise.all(
        ordenSnap.docs
          .filter(orden => !orden.data().fechaHoraBajaOrdenCompra)
          .map(async (orden) => {
            const id = orden.id;
            const { codProveedor, fechaHoraOrdenCompra } = orden.data();

            // Si el proveedor está dado de baja, no incluyas la orden
            if (!provMap[codProveedor]) return null;

            const estadoSnap = await getDocs(query(
              collection(db, "OrdenCompra", id, "EstadoOrdenCompra"),
              where("fechaHoraBajaEstadoCompra", "==", null)
            ));
            const estado = estadoSnap.empty ? "Sin estado" : estadoSnap.docs[0].data().nombreEstadoCompra;

            const detalleSnap = await getDocs(collection(db, "OrdenCompra", id, "DetalleOrdenCompra"));
            const detalleDoc = detalleSnap.docs[0];
            const detalleId = detalleDoc?.id;
            const detalle = detalleDoc?.data();
            const precioTotal = detalle?.precioTotal ?? 0;

            const articulosSnap = detalleId
              ? await getDocs(collection(db, "OrdenCompra", id, "DetalleOrdenCompra", detalleId, "articulos"))
              : [];

            // Artículos activos
            const articulosOrden = articulosSnap.docs
              .map((a) => ({
                id: a.id,
                nombre: artMap[a.id] ?? a.id,
                ...a.data(),
              }))
              .filter((a) => artMap[a.id]); // solo artículos activos

            return {
              id,
              proveedor: provMap[codProveedor] ?? codProveedor,
              fecha: fechaHoraOrdenCompra?.toDate(),
              estado,
              precioTotal,
              articulos: articulosOrden,
            };
          })
      );

      setOrdenes(ordenesConDatos.filter(Boolean));
    };

    fetchData();
  }, []);

  const ordenesFiltradas = ordenes
    .filter((o) => o.proveedor.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) =>
      ordenAsc ? a.fecha?.getTime() - b.fecha?.getTime() : b.fecha?.getTime() - a.fecha?.getTime()
    );

  return (
    <div className="container my-4">
      <h4>📋 Órdenes de Compra</h4>
      <input
        className="form-control mb-3"
        placeholder="Buscar por proveedor..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <button
        className="btn btn-sm btn-outline-secondary mb-2"
        onClick={() => setOrdenAsc(!ordenAsc)}
      >
        Ordenar por fecha {ordenAsc ? "↑" : "↓"}
      </button>

      {ordenesFiltradas.map((orden) => (
        <div key={orden.id} className="card mb-3 p-3">
          <h5>Orden #{orden.id}</h5>
          <p><strong>Proveedor:</strong> {orden.proveedor}</p>
          <p><strong>Fecha:</strong> {orden.fecha?.toLocaleString()}</p>
          <p><strong>Estado:</strong> {orden.estado}</p>
          <p><strong>Precio Total:</strong> ${orden.precioTotal.toFixed(2)}</p>

          {orden.articulos.length > 0 ? (
            <table className="table table-sm table-bordered mt-3">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {orden.articulos.map((a, idx) => (
                  <tr key={idx}>
                    <td>{a.nombre}</td>
                    <td>${a.precioArticulo}</td>
                    <td>{a.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">Sin artículos registrados.</p>
          )}
        </div>
      ))}
    </div>
  );
}
