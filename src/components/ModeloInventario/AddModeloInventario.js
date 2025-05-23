import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddModeloInventario() {
  const [articulos, setArticulos] = useState([]);
  const [modelo, setModelo] = useState("Lote Fijo");
  const [stockSeguridad, setStockSeguridad] = useState("");
  const [articuloId, setArticuloId] = useState("");
  const [loteOptimo, setLoteOptimo] = useState("");
  const [puntoPedido, setPuntoPedido] = useState("");
  const [inventarioMaximo, setInventarioMaximo] = useState("");

  useEffect(() => {
    const fetchArticulos = async () => {
      const snap = await getDocs(collection(db, "Articulos"));
setArticulos(
  snap.docs.map((d) => ({
    id: d.id,
    nombre: d.data().nombreArticulo, // ✅ USAR nombreArticulo
  }))
);

    };
    fetchArticulos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modelo || !articuloId || !stockSeguridad) return alert("Completa los campos");

    const data = {
      nombreModeloInventario: modelo,
      stockDeSeguridad: parseInt(stockSeguridad),
      codArticulo: articuloId,
    };

    if (modelo === "Lote Fijo") {
      data.loteOptimo = parseInt(loteOptimo);
      data.puntoPedido = parseInt(puntoPedido);
    } else if (modelo === "Inventario Fijo") {
      data.inventarioMaximo = parseInt(inventarioMaximo);
    }

    await addDoc(collection(db, "ModeloInventario"), data);

    alert("Modelo de inventario agregado");
    setStockSeguridad("");
    setArticuloId("");
    setLoteOptimo("");
    setPuntoPedido("");
    setInventarioMaximo("");
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
        <option value="Inventario Fijo">Inventario Fijo</option>
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

      {modelo === "Lote Fijo" && (
        <>
          <input
            className="form-control mb-2"
            placeholder="Lote óptimo"
            type="number"
            value={loteOptimo}
            onChange={(e) => setLoteOptimo(e.target.value)}
          />
          <input
            className="form-control mb-3"
            placeholder="Punto de pedido"
            type="number"
            value={puntoPedido}
            onChange={(e) => setPuntoPedido(e.target.value)}
          />
        </>
      )}

      {modelo === "Inventario Fijo" && (
        <input
          className="form-control mb-3"
          placeholder="Inventario máximo"
          type="number"
          value={inventarioMaximo}
          onChange={(e) => setInventarioMaximo(e.target.value)}
        />
      )}

      <button className="btn btn-success">Guardar</button>
    </form>
  );
}
