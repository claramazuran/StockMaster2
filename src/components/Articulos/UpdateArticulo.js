import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../../firebase/config";

export default function UpdateArticulo() {
  const [articulos, setArticulos] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [articulo, setArticulo] = useState(null);

  // Obtener lista de artículos
  useEffect(() => {
    const fetchArticulos = async () => {
      const snapshot = await getDocs(collection(db, "Articulos"));
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        descripcion: doc.data().descripcionArticulo,
      }));
      setArticulos(lista);
    };
    fetchArticulos();
  }, []);

  // Cargar artículo seleccionado
  useEffect(() => {
    if (!selectedId) return;
    const cargarArticulo = async () => {
      const ref = doc(db, "Articulos", selectedId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setArticulo(snap.data());
      } else {
        setArticulo(null);
      }
    };
    cargarArticulo();
  }, [selectedId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const ref = doc(db, "Articulos", selectedId);
    await updateDoc(ref, {
      ...articulo,
      costoAlmacenamientoArticulo: parseFloat(articulo.costoAlmacenamientoArticulo),
      costoCompra: parseFloat(articulo.costoCompra),
      costoPedidoArticulo: parseFloat(articulo.costoPedidoArticulo),
      demandaArticulo: parseInt(articulo.demandaArticulo),
      stockActualArticulo: parseInt(articulo.stockActualArticulo),
    });
    alert("Artículo actualizado");
  };

  return (
    <div className="container my-4">
      <h4>✏️ Actualizar Artículo</h4>

      <select
        className="form-select mb-3"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.descripcion}</option>
        ))}
      </select>

      {articulo && (
        <form onSubmit={handleUpdate}>
          <input className="form-control mb-2" placeholder="Descripción"
            value={articulo.descripcionArticulo}
            onChange={(e) => setArticulo({ ...articulo, descripcionArticulo: e.target.value })}
          />
          <input className="form-control mb-2" placeholder="Costo almacenamiento"
            type="number" value={articulo.costoAlmacenamientoArticulo}
            onChange={(e) => setArticulo({ ...articulo, costoAlmacenamientoArticulo: e.target.value })}
          />
          <input className="form-control mb-2" placeholder="Costo compra"
            type="number" value={articulo.costoCompra}
            onChange={(e) => setArticulo({ ...articulo, costoCompra: e.target.value })}
          />
          <input className="form-control mb-2" placeholder="Costo pedido"
            type="number" value={articulo.costoPedidoArticulo}
            onChange={(e) => setArticulo({ ...articulo, costoPedidoArticulo: e.target.value })}
          />
          <input className="form-control mb-2" placeholder="Demanda"
            type="number" value={articulo.demandaArticulo}
            onChange={(e) => setArticulo({ ...articulo, demandaArticulo: e.target.value })}
          />
          <input className="form-control mb-2" placeholder="Stock actual"
            type="number" value={articulo.stockActualArticulo}
            onChange={(e) => setArticulo({ ...articulo, stockActualArticulo: e.target.value })}
          />
          <button className="btn btn-warning">Actualizar</button>
        </form>
      )}
    </div>
  );
}
