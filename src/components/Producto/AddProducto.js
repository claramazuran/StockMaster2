import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import db from "../../firebase";

export default function VerProductoProveedor() {
  const [productosConTipos, setProductosConTipos] = useState([]);

  useEffect(() => {
    const fetchTodo = async () => {
      const productosSnapshot = await getDocs(collection(db, "Productos"));
      const data = [];

      for (const prodDoc of productosSnapshot.docs) {
        const productoId = prodDoc.id;
        const tiposRef = collection(db, "Productos", productoId, "productoProveedor");
        const tiposSnapshot = await getDocs(tiposRef);

        const tipos = tiposSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (tipos.length > 0) {
          data.push({ productoId, tipos });
        }
      }

      setProductosConTipos(data);
    };

    fetchTodo();
  }, []);

  const actualizarStock = async (productoId, tipoId, cantidad) => {
    const ref = doc(db, "Productos", productoId, "productoProveedor", tipoId);
    const nuevoProductosConTipos = productosConTipos.map((p) => {
      if (p.productoId !== productoId) return p;
      const nuevosTipos = p.tipos.map((t) => {
        if (t.id !== tipoId) return t;
        const nuevoStock = Math.max(0, t.stock + cantidad);
        return { ...t, stock: nuevoStock };
      });
      return { ...p, tipos: nuevosTipos };
    });

    const tipo = nuevoProductosConTipos
      .find(p => p.productoId === productoId)
      .tipos.find(t => t.id === tipoId);

    await updateDoc(ref, { stock: tipo.stock });
    setProductosConTipos(nuevoProductosConTipos);
  };

  return (
    <div className="container my-4">
      <h4>📦 Stock de todos los productos y sus variantes</h4>

      {productosConTipos.map((producto) => (
        <div key={producto.productoId} className="mb-5">
          <h5 className="mb-3 border-bottom pb-1">
            🛒 Producto: <strong>{producto.productoId}</strong>
          </h5>
          <div className="row">
            {producto.tipos.map((tipo) => (
              <div className="col-md-4" key={tipo.id}>
                <div className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title">{tipo.id}</h6>
                    <p className="card-text">
                      <strong>Precio:</strong> ${tipo.precio}<br />
                      <strong>Stock:</strong> {tipo.stock}<br />
                      <strong>Proveedor:</strong> {tipo.proveedorId}
                    </p>
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => actualizarStock(producto.productoId, tipo.id, -1)}
                      >
                        ➖
                      </button>
                      <button
                        className="btn btn-outline-success"
                        onClick={() => actualizarStock(producto.productoId, tipo.id, 1)}
                      >
                        ➕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
