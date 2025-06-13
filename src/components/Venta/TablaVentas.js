import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import db from "../../firebase";

export default function TablaVentas() {
  const [ventas, setVentas] = useState([]);
  const [nombresArticulos, setNombresArticulos] = useState({});

  useEffect(() => {
    const fetchVentas = async () => {
      // 1. Traer todos los artículos y armar el mapa id -> nombre
      const artSnap = await getDocs(collection(db, "Articulos"));
      const nombres = {};
      artSnap.docs.forEach(d => {
        nombres[d.id] = d.data().nombreArticulo || d.id;
      });
      setNombresArticulos(nombres);

      // 2. Traer ventas y detalles
      const snap = await getDocs(collection(db, "Venta"));
      const data = [];

      for (const docVenta of snap.docs) {
        const ventaId = docVenta.id;
        const ventaData = docVenta.data();

        const detalleSnap = await getDocs(collection(db, "Venta", ventaId, "DetalleVenta"));
        const articulos = detalleSnap.docs.map(d => d.data());

        data.push({
          id: ventaId,
          fecha: ventaData.fechaHoraVenta?.toDate().toLocaleString() || "-",
          total: ventaData.precioTotalVenta || 0,
          articulos,
        });
      }

      setVentas(data);
    };

    fetchVentas();
  }, []);

  return (
    <div className="container my-4">
      <h4>📋 Tabla de Ventas</h4>
      {ventas.map((venta) => (
        <div key={venta.id} className="card mb-4">
          <div className="card-header bg-primary text-white">
            <strong>Venta #{venta.id}</strong> — Fecha: {venta.fecha}
          </div>
          <div className="card-body">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Artículo</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {venta.articulos.map((art, i) => (
                  <tr key={i}>
                    <td>{nombresArticulos[art.codArticulo] || art.codArticulo}</td>
                    <td>${parseFloat(art.precioVentaArticulo).toFixed(2)}</td>
                    <td>{art.cantidadVendidaArticulo}</td>
                    <td>
                      ${(art.precioVentaArticulo * art.cantidadVendidaArticulo).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="table-secondary">
                  <td colSpan="3" className="text-end"><strong>Total</strong></td>
                  <td><strong>${venta.total.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
