import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AjusteInventario() {
  const [articulos, setArticulos] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [stockActual, setStockActual] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const fetchArticulos = async () => {
      const snap = await getDocs(collection(db, "Articulo"));
      setArticulos(
        snap.docs
          .map((d) => ({
            id: d.id,
            nombre: d.data().nombreArticulo,
            baja: d.data().fechahorabaja || null,
          }))
          .filter((a) => !a.baja)
      );
    };
    fetchArticulos();
  }, []);

  const handleSelectArticulo = async (id) => {
    setSelectedId(id);
    setEditando(false);
    if (id) {
      const ref = doc(db, "Articulo", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setStockActual(snap.data().stockActualArticulo);
      }
    } else {
      setStockActual(null);
    }
  };

  const handleGuardar = async () => {
    if (selectedId === "" || stockActual === null) return alert("Seleccioná un artículo");
    await updateDoc(doc(db, "Articulo", selectedId), {
      stockActualArticulo: parseInt(stockActual),
    });
    alert("Stock actualizado correctamente");
    setSelectedId("");
    setStockActual(null);
    setEditando(false);
  };

  return (
    <div className="container my-4">
      <h4>🔧 Ajuste Manual de Inventario</h4>

      <select
        className="form-select mb-3"
        value={selectedId}
        onChange={(e) => handleSelectArticulo(e.target.value)}
      >
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nombre}
          </option>
        ))}
      </select>

      {selectedId && (
        <div className="d-flex align-items-center mb-3 gap-3">
          <button
            className="btn btn-outline-danger"
            onClick={() => setStockActual((prev) => Math.max(0, prev - 1))}
          >
            ➖
          </button>

          {editando ? (
            <input
              type="number"
              value={stockActual}
              className="form-control"
              style={{ width: "100px" }}
              onChange={(e) => setStockActual(parseInt(e.target.value))}
              onBlur={() => setEditando(false)}
              autoFocus
            />
          ) : (
            <span
              className="fs-4"
              style={{ cursor: "pointer" }}
              onClick={() => setEditando(true)}
            >
              🧮 {stockActual}
            </span>
          )}

          <button
            className="btn btn-outline-success"
            onClick={() => setStockActual((prev) => prev + 1)}
          >
            ➕
          </button>
        </div>
      )}

      {selectedId && (
        <button className="btn btn-warning" onClick={handleGuardar}>
          Guardar cambios
        </button>
      )}
    </div>
  );
}
