import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddArticulo() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [costoAlmacenamiento, setCostoAlmacenamiento] = useState("");
  const [costoCompra, setCostoCompra] = useState("");
  const [costoPedido, setCostoPedido] = useState("");
  const [demanda, setDemanda] = useState("");
  const [stock, setStock] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "Articulos"), {
      nombreArticulo: nombre,
      descripcionArticulo: descripcion,
      costoAlmacenamientoArticulo: parseFloat(costoAlmacenamiento),
      costoCompra: parseFloat(costoCompra),
      costoPedidoArticulo: parseFloat(costoPedido),
      demandaArticulo: parseInt(demanda),
      stockActualArticulo: parseInt(stock),
    });

    alert("Artículo agregado");
    setNombre("");
    setDescripcion("");
    setCostoAlmacenamiento("");
    setCostoCompra("");
    setCostoPedido("");
    setDemanda("");
    setStock("");
  };

  return (
    <form onSubmit={handleSubmit} className="container my-3">
      <h4>➕ Agregar Artículo</h4>
      <input className="form-control mb-2" placeholder="nombre"
        value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input className="form-control mb-2" placeholder="Descripción"
        value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      <input className="form-control mb-2" placeholder="Costo de almacenamiento"
        type="number" value={costoAlmacenamiento} onChange={(e) => setCostoAlmacenamiento(e.target.value)} />
      <input className="form-control mb-2" placeholder="Costo de compra"
        type="number" value={costoCompra} onChange={(e) => setCostoCompra(e.target.value)} />
      <input className="form-control mb-2" placeholder="Costo de pedido"
        type="number" value={costoPedido} onChange={(e) => setCostoPedido(e.target.value)} />
      <input className="form-control mb-2" placeholder="Demanda"
        type="number" value={demanda} onChange={(e) => setDemanda(e.target.value)} />
      <input className="form-control mb-2" placeholder="Stock actual"
        type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
      <button className="btn btn-success">Guardar</button>
    </form>
  );
}
