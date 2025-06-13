import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddModeloInventario() {
  const [articulos, setArticulos] = useState([]);
  const [modelo, setModelo] = useState("Lote Fijo");
  const [stockSeguridad, setStockSeguridad] = useState("");
  const [articuloId, setArticuloId] = useState("");

  useEffect(() => {
    const fetchArticulos = async () => {
      const snap = await getDocs(collection(db, "Articulos"));
      setArticulos(
        snap.docs.map((d) => ({
          id: d.id,
          nombre: d.data().nombreArticulo,
        }))
      );
    };
    fetchArticulos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modelo || !articuloId || !stockSeguridad) return alert("Completa los campos");

    // Buscar proveedor predeterminado
    const proveedoresSnap = await getDocs(collection(db, "Articulos", articuloId, "ProveedorArticulo"));
    const predeterminado = proveedoresSnap.docs.find((doc) => doc.data().esProveedorPredeterminado === true);
    if (!predeterminado) return alert("El artículo no tiene proveedor predeterminado");

    const proveedor = predeterminado.data();
    const L = parseInt(proveedor.DemoraEntrega);
    const S = parseFloat(proveedor.CargosPedido);

    // Obtener datos del artículo
    const artSnap = await getDocs(collection(db, "Articulos"));
    const articulo = artSnap.docs.find((d) => d.id === articuloId)?.data();
    const D = parseInt(articulo.demandaArticulo);

    let data = {
      nombreModeloInventario: modelo,
      stockDeSeguridad: parseInt(stockSeguridad),
      codArticulo: articuloId,
    };

    if (modelo === "Lote Fijo") {
      const loteOptimo = Math.round(Math.sqrt((2 * D * S) / articulo.costoAlmacenamientoArticulo));
      const puntoPedido = Math.round((D / 30) * L + parseInt(stockSeguridad));

      data = {
        ...data,
        loteOptimo,
        puntoPedido,
      };
    } else if (modelo === "Periodo Fijo") {
      const inventarioMaximo = Math.round((D / 30) * L + parseInt(stockSeguridad));
      data = {
        ...data,
        inventarioMaximo,
      };
    }

    await addDoc(collection(db, "ModeloInventario"), data);
    alert("Modelo de inventario agregado");
    setStockSeguridad("");
    setArticuloId("");
  };

  return (
    <form onSubmit={handleSubmit} className="container my-4">
      <h4>➕ Agregar Modelo de Inventario</h4>

      <select
        className="form-select mb-3"
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
      >
        <option value="Lote Fijo">Lote Fijo</option>
        <option value="Periodo Fijo">Periodo Fijo</option>
      </select>

      <select
        className="form-select mb-3"
        value={articuloId}
        onChange={(e) => setArticuloId(e.target.value)}
      >
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nombre}
          </option>
        ))}
      </select>

      <input
        className="form-control mb-2"
        placeholder="Stock de seguridad"
        type="number"
        value={stockSeguridad}
        onChange={(e) => setStockSeguridad(e.target.value)}
      />

      <button className="btn btn-success">Guardar</button>
    </form>
  );
}
