import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import db from "../../firebase";

export default function TablaVentas() {
  const [ventas, setVentas] = useState([]);
  const [nombresArticulos, setNombresArticulos] = useState({});
  const [ordenDesc, setOrdenDesc] = useState(true); // true = más reciente primero

  useEffect(() => {
    const fetchVentas = async () => {
      // Traer todos los artículos y armar el mapa id -> nombre
      const artSnap = await getDocs(collection(db, "Articulo"));
      const nombres = {};
      artSnap.docs.forEach(d => {
        if (!d.data().fechahorabaja) {
          nombres[d.id] = d.data().nombreArticulo || d.id;
        }
      });
      setNombresArticulos(nombres);

      // Traer ventas
      const snap = await getDocs(collection(db, "Venta"));
      const data = snap.docs
        .map(docVenta => {
          const ventaData = docVenta.data();
          return {
            id: docVenta.id,
            fechaObj: ventaData.fechaHoraVenta?.toDate
              ? ventaData.fechaHoraVenta.toDate()
              : null,
            fecha: ventaData.fechaHoraVenta?.toDate
              ? ventaData.fechaHoraVenta.toDate().toLocaleString()
              : "-",
            total: ventaData.precioTotalVenta || 0,
            codArticulo: ventaData.codArticulo,
            cantidad: ventaData.cantidadVendidaArticulo,
          };
        })
        // Solo ventas con artículo válido
        .filter(v => v.codArticulo && nombres[v.codArticulo]);

      setVentas(data);
    };

    fetchVentas();
  }, []);

  // Ordenar ventas según el estado del botón
  const ventasOrdenadas = [...ventas].sort((a, b) => {
    if (!a.fechaObj || !b.fechaObj) return 0;
    return ordenDesc
      ? b.fechaObj.getTime() - a.fechaObj.getTime()
      : a.fechaObj.getTime() - b.fechaObj.getTime();
  });

  return (
    <div className="container my-4">
      <h4>📋 Tabla de Ventas</h4>
      <button
        className="btn btn-outline-primary mb-3"
        onClick={() => setOrdenDesc((prev) => !prev)}
      >
        {ordenDesc ? "Mostrar más antiguas primero" : "Mostrar más recientes primero"}
      </button>
      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr>
            <th>Artículo</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {ventasOrdenadas.map((venta) => (
            <tr key={venta.id}>
              <td>{nombresArticulos[venta.codArticulo] || venta.codArticulo}</td>
              <td>{venta.fecha}</td>
              <td>{venta.cantidad}</td>
              <td>${parseFloat(venta.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}