import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import db from "../../firebase";

export default function TablaOrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState({});
  const [proveedoresBaja, setProveedoresBaja] = useState({});
  const [articulos, setArticulos] = useState({});
  const [filtro, setFiltro] = useState("");
  const [ordenAsc, setOrdenAsc] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log("INICIO FETCH DATA");
      const [provSnap, artSnap, ordenSnap] = await Promise.all([
        getDocs(collection(db, "Proveedor")),
        getDocs(collection(db, "Articulo")),
        getDocs(collection(db, "OrdenCompra")),
      ]);

      // Proveedores activos y dados de baja
      const provMap = {};
      const provBajaMap = {};
      provSnap.docs.forEach((d) => {
        if (!d.data().fechaHoraBajaProveedor) {
          provMap[d.id] = d.data().nombreProveedor;
        } else {
          provBajaMap[d.id] = d.data().nombreProveedor;
        }
      });
      setProveedores(provMap);
      setProveedoresBaja(provBajaMap);

      // Artículos activos
      const artMap = {};
      artSnap.docs.forEach((d) => {
        if (!d.data().fechahorabaja) {
          artMap[d.id] = d.data().nombreArticulo;
        }
      });
      setArticulos(artMap);

      // Procesar órdenes (ahora usando los campos directos del documento)
      const ordenesConDatos = await Promise.all(
        ordenSnap.docs
          .filter((orden) => !orden.data().fechaHoraBajaOrdenCompra)
          .map(async (orden) => {
            const d = orden.data();
            const id = orden.id;

            console.log("ORDEN:", d);

            const {
              codProveedor,
              fechaHoraOrdenCompra,
              numeroDeOrdenCompra,
              codArticulo,
              cantidadComprada,
            } = d;

            // Estado actual
            // (puede seguir igual si usás subcolección EstadoOrdenCompra)
            let estado = "Sin estado";
            try {
              const estadoSnap = await getDocs(
                collection(db, "OrdenCompra", id, "EstadoOrdenCompra")
              );
              if (!estadoSnap.empty) {
                const actual = estadoSnap.docs.find(
                  (e) => e.data().fechaHoraBajaEstadoCompra == null
                );
                if (actual) estado = actual.data().nombreEstadoCompra;
              }
            } catch (e) {
              // Si no existe subcolección, ignora
            }

            // ARTICULO y proveedor
            let nombreArticulo = codArticulo;
            let articuloActivo = false;
            let precioUnitario = 0;
            let costoCompra = 0;

            if (codArticulo) {
              const articuloRef = doc(db, "Articulo", codArticulo);
              const articuloDoc = await getDoc(articuloRef);
              if (articuloDoc.exists()) {
                const artData = articuloDoc.data();
                nombreArticulo = artData.nombreArticulo;
                articuloActivo = !artData.fechaHoraBajaArticulo;
                // Buscar proveedor para precio unitario y costo
                if (codProveedor) {
                  const proveedorRef = doc(
                    db,
                    "Articulo",
                    codArticulo,
                    "ArticuloProveedor",
                    codProveedor
                  );
                  const proveedorDoc = await getDoc(proveedorRef);
                  if (proveedorDoc.exists()) {
                    const provData = proveedorDoc.data();
                    precioUnitario = provData.precioUnitario || 0;
                    costoCompra = provData.costoCompra || 0;
                    console.log("ARTICULO PROVEEDOR", provData);
                  } else {
                    console.log("NO EXISTE ArticuloProveedor para", codArticulo, codProveedor);
                  }
                }
              }
            }

            const precioTotal = (precioUnitario * (cantidadComprada || 0)) + costoCompra;
            let proveedorLabel = provMap[codProveedor] || provBajaMap[codProveedor] || codProveedor;
            if (provBajaMap[codProveedor]) proveedorLabel += " (Baja)";

            return {
              id,
              numeroDeOrdenCompra,
              proveedor: proveedorLabel,
              fecha: fechaHoraOrdenCompra?.toDate?.() || new Date(),
              estado,
              precioTotal,
              articulos: codArticulo
                ? [
                    {
                      id: codArticulo,
                      nombre: nombreArticulo,
                      precioUnitario,
                      costoCompra,
                      cantidad: cantidadComprada,
                      activo: articuloActivo,
                    },
                  ]
                : [],
            };
          })
      );

      console.log("ORDENES FINAL:", ordenesConDatos);
      setOrdenes(ordenesConDatos.filter(Boolean));
    };

    fetchData();
  }, []);

  const ordenesFiltradas = ordenes
    .filter((o) =>
      (o.proveedor || "").toLowerCase().includes(filtro.toLowerCase())
    )
    .sort((a, b) =>
      ordenAsc
        ? a.fecha?.getTime() - b.fecha?.getTime()
        : b.fecha?.getTime() - a.fecha?.getTime()
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

      {ordenesFiltradas.length === 0 && (
        <div className="alert alert-warning">
          No hay órdenes de compra para mostrar.
        </div>
      )}

      {ordenesFiltradas.map((orden) => (
        <div key={orden.id} className="card mb-3 p-3">
          <h5>
            Orden N°{orden.numeroDeOrdenCompra || orden.id}
          </h5>
          <p>
            <strong>Proveedor:</strong> {orden.proveedor}
          </p>
          <p>
            <strong>Fecha:</strong> {orden.fecha?.toLocaleString()}
          </p>
          <p>
            <strong>Estado:</strong> {orden.estado}
          </p>
          <p>
            <strong>Precio Total:</strong> ${orden.precioTotal.toFixed(2)}
          </p>

          {orden.articulos.length > 0 ? (
            <table className="table table-sm table-bordered mt-3">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Costo Compra</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {orden.articulos.map((a, idx) => (
                  <tr key={idx}>
                    <td>
                      {a.nombre}
                      {!a.activo && (
                        <span className="text-danger ms-2">(Baja)</span>
                      )}
                    </td>
                    <td>${a.precioUnitario}</td>
                    <td>{a.cantidad}</td>
                    <td>${a.costoCompra}</td>
                    <td>
                      {a.activo ? "Activo" : "Dado de baja"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">
              Sin artículos registrados.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
