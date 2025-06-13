import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddOrdenPorArticulo() {
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [items, setItems] = useState([]);

  // Cargar artículos con proveedor predeterminado activo y cálculo sugerido
  useEffect(() => {
    const fetchArticulosConProveedor = async () => {
      const artSnap = await getDocs(collection(db, "Articulos"));
      const articulos = [];

      for (const artDoc of artSnap.docs) {
        const art = artDoc.data();
        if (art.fechahorabaja) continue;

        // Buscar proveedor predeterminado activo
        const provSnap = await getDocs(collection(db, "Articulos", artDoc.id, "ProveedorArticulo"));
        const pred = provSnap.docs.find(
          p => p.data().esProveedorPredeterminado && !p.data().fechaHoraBajaProveedorArticulo
        );
        if (!pred) continue;

        const proveedor = pred.data();
        // Traer modelo inventario
        const modelosSnap = await getDocs(collection(db, "ModeloInventario"));
        const modelo = modelosSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .find(m => m.codArticulo === artDoc.id);

        // Calcular cantidad sugerida
        let cantidadSugerida = 1;
        if (modelo) {
          if (modelo.nombreModeloInventario === "Lote Fijo") {
            cantidadSugerida = modelo.loteOptimo ?? 1;
          } else if (modelo.nombreModeloInventario === "Periodo Fijo") {
            cantidadSugerida = modelo.inventarioMaximo ?? 1;
          }
        }

        articulos.push({
          id: artDoc.id,
          nombre: art.nombreArticulo,
          proveedorPredeterminado: proveedor.codProveedor,
          nombreProveedor: proveedor.nombreProveedor || "", // si lo tenés guardado
          cantidadSugerida,
          modelo,
          stockActual: art.stockActualArticulo || 0,
          puntoPedido: modelo?.puntoPedido || "-",
        });
      }
      setArticulosDisponibles(articulos);
    };
    fetchArticulosConProveedor();
  }, []);

  const handleAgregarItem = () => {
    setItems([...items, { codArticulo: "", cantidad: "" }]);
  };

  const handleEliminarItem = (index) => {
    const nuevo = [...items];
    nuevo.splice(index, 1);
    setItems(nuevo);
  };

  const handleItemChange = (index, campo, valor) => {
    const nuevo = [...items];
    nuevo[index][campo] = valor;
    setItems(nuevo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert("Agregá al menos un artículo");

    for (const item of items) {
      if (!item.codArticulo || !item.cantidad) {
        return alert("Completá todos los campos");
      }
      const articulo = articulosDisponibles.find(a => a.id === item.codArticulo);
      if (!articulo) return alert("Artículo no válido");

      // Validación de punto de pedido para Lote Fijo
      if (
        articulo.modelo &&
        articulo.modelo.nombreModeloInventario === "Lote Fijo" &&
        (articulo.stockActual + parseInt(item.cantidad, 10)) <= articulo.puntoPedido
      ) {
        return alert(
          `No se puede crear la OC para "${articulo.nombre}":\n` +
          `La cantidad total (${articulo.stockActual} en stock + ${item.cantidad} a pedir = ${articulo.stockActual + parseInt(item.cantidad)}) no supera el punto de pedido (${articulo.puntoPedido}).`
        );
      }
    }

    // Registrar una OC por cada artículo (puede ser 1 OC con muchos items, eso depende de tu modelo de datos)
    for (const item of items) {
      const articulo = articulosDisponibles.find(a => a.id === item.codArticulo);
      const fecha = new Date();

      const ordenRef = await addDoc(collection(db, "OrdenCompra"), {
        fechaHoraOrdenCompra: fecha,
        codProveedor: articulo.proveedorPredeterminado,
        codArticulo: articulo.id,
      });

      await setDoc(doc(db, "OrdenCompra", ordenRef.id, "EstadoOrdenCompra", "Pendiente"), {
        nombreEstadoCompra: "Pendiente",
        fechaHoraAltaEstadoCompra: fecha,
        fechaHoraBajaEstadoCompra: null,
      });

      const detalleRef = await addDoc(collection(db, "OrdenCompra", ordenRef.id, "DetalleOrdenCompra"), {
        fechaHoraAlta: fecha,
        fechaHoraBaja: null,
        precioTotal: 0, // o calcula según precio artículo, si lo tenés
      });

      // Artículo comprado
      const articulosRef = collection(db, "OrdenCompra", ordenRef.id, "DetalleOrdenCompra", detalleRef.id, "articulos");
      await setDoc(doc(articulosRef, articulo.id), {
        codArticulo: articulo.id,
        cantidad: parseInt(item.cantidad),
      });
    }

    alert("Órdenes de compra registradas correctamente");
    setItems([]);
  };

  return (
    <form onSubmit={handleSubmit} className="container my-4">
      <h4>➕ Crear Orden de Compra por Artículo</h4>
      <button
        type="button"
        className="btn btn-outline-primary mb-3"
        onClick={handleAgregarItem}
      >
        ➕ Agregar Artículo
      </button>
      {items.map((item, i) => (
        <div key={i} className="card mb-3 p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <select
                className="form-select"
                value={item.codArticulo}
                onChange={(e) => handleItemChange(i, "codArticulo", e.target.value)}
              >
                <option value="">Seleccionar artículo</option>
                {articulosDisponibles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} (Proveedor: {a.nombreProveedor || a.proveedorPredeterminado})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={item.cantidad}
                min={1}
                onChange={(e) => handleItemChange(i, "cantidad", e.target.value)}
              />
            </div>
            <div className="col-md-4">
              {/* Sugerencia/cálculo para ayudar al usuario */}
              {item.codArticulo && (() => {
                const art = articulosDisponibles.find(a => a.id === item.codArticulo);
                if (!art) return null;
                return (
                  <div>
                    <span className="badge bg-info">
                      Sugerido: {art.cantidadSugerida}
                    </span>{" "}
                    <span className="badge bg-secondary">
                      Stock actual: {art.stockActual}
                    </span>
                    {art.puntoPedido !== "-" && (
                      <span className="badge bg-warning text-dark">
                        Punto pedido: {art.puntoPedido}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="col-md-12 mt-2">
              <button
                className="btn btn-outline-danger w-100"
                type="button"
                onClick={() => handleEliminarItem(i)}
              >
                ➖
              </button>
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-success" type="submit">
        Crear Orden/es de Compra
      </button>
    </form>
  );
}
