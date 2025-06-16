import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import db from "../../firebase";

export default function AddOrdenPorArticulo() {
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [items, setItems] = useState([]);
  const [proveedores, setProveedores] = useState({}); // Mapa id -> nombre

  // Cargar proveedores y artículos con proveedor predeterminado activo y cálculo sugerido
  useEffect(() => {
    const fetchArticulosConProveedor = async () => {
      // Traer proveedores y armar un mapa id -> nombre
      const provSnap = await getDocs(collection(db, "Proveedor"));
      const provMap = {};
      provSnap.docs.forEach(d => {
        provMap[d.id] = d.data().nombreProveedor;
      });
      setProveedores(provMap);

      // Traer artículos
      const artSnap = await getDocs(collection(db, "Articulo"));
      const articulos = [];

      for (const artDoc of artSnap.docs) {
        const art = artDoc.data();
        if (art.fechahorabaja) continue;

        // Buscar proveedor predeterminado activo
        const provArtSnap = await getDocs(collection(db, "Articulo", artDoc.id, "ArticuloProveedor"));
        const pred = provArtSnap.docs.find(
          p => p.data().esProveedorPredeterminado && !p.data().fechaHoraBajaArticuloProveedor
        );
        if (!pred) continue;

        const proveedor = pred.data();

        // Acá obtenemos el nombre real del proveedor
        const nombreProveedorReal = provMap[proveedor.codProveedor] || proveedor.codProveedor;

        // Traer modelo inventario
        const modelosSnap = await getDocs(collection(db, "ModeloInventario"));
        const modelo = modelosSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .find(m => m.codArticulo === artDoc.id);

        // Calcular cantidad sugerida
        /*let cantidadSugerida = 1;
        if (modelo) {
          if (modelo.nombreModeloInventario === "Lote Fijo") {
            cantidadSugerida = modelo.loteOptimo ?? 1;
          } else if (modelo.nombreModeloInventario === "Periodo Fijo") {
            cantidadSugerida = modelo.inventarioMaximo ?? 1;
          }
        }*/

        // Tomar cantidad sugerida desde Firestore
        let cantidadSugerida = modelo?.cantidadAPedirOptima ?? 1;


        articulos.push({
          id: artDoc.id,
          nombre: art.nombreArticulo,
          proveedorPredeterminado: proveedor.codProveedor,
          nombreProveedor: nombreProveedorReal,
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

  // Funcion para Agregar Items a la Orden de Compra
  const handleAgregarItem = () => {
    setItems([...items, { codArticulo: "", cantidad: "" }]);
  };

  // Funcion para Eliminar Items de la Orden de Compra
  const handleEliminarItem = (index) => {
    const nuevo = [...items];
    nuevo.splice(index, 1);
    setItems(nuevo);
  };

  // Funcion para cambiar un campo de un Item de la Orden de Compra
  const handleItemChange = (index, campo, valor) => {
    const nuevo = [...items];
    nuevo[index][campo] = valor;
    setItems(nuevo);
  };

  // Funcion para enviar la Orden de Compra
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert("Agregá al menos un artículo");

    for (const item of items) {
      if (!item.codArticulo || !item.cantidad) {
        return alert("Completá todos los campos");
      }
      const articulo = articulosDisponibles.find(a => a.id === item.codArticulo);
      if (!articulo) return alert("Artículo no válido");

      // Validación de cantidad pedida
      const cantidadPedida = parseInt(item.cantidad, 10); // Convertir a número
      if (isNaN(cantidadPedida) || cantidadPedida < 1) { // Validar número y mayor a 0
        return alert("La cantidad debe ser un número mayor a 0");
      }

      // Validación de cantidad sugerida
      if (cantidadPedida < articulo.cantidadSugerida) { // Validar cantidad pedida vs sugerida
        return alert(
          `La cantidad pedida para "${articulo.nombre}" debe ser igual o mayor a la sugerida (${articulo.cantidadSugerida}).`
        );
      }

      // Validación de punto de pedido para Lote Fijo
      if (
        articulo.modelo &&
        articulo.modelo.nombreModeloInventario === "Lote Fijo" &&
        (articulo.stockActual + cantidadPedida) <= articulo.puntoPedido
      ) {
        return alert(
          `No se puede crear la OC para "${articulo.nombre}":\n` +
          `La cantidad total (${articulo.stockActual} en stock + ${cantidadPedida} a pedir = ${articulo.stockActual + cantidadPedida}) no supera el punto de pedido (${articulo.puntoPedido}).`
        );
      }
    }

    // Registrar una OC por cada artículo
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
        precioTotal: 0,
      });

      // Artículo comprado
      const articulosRef = collection(db, "OrdenCompra", ordenRef.id, "DetalleOrdenCompra", detalleRef.id, "Articulo");
      await setDoc(doc(articulosRef, articulo.id), {
        codArticulo: articulo.id,
        cantidad: parseInt(item.cantidad),
      });
    }

    alert("Órdenes de compra registradas correctamente");
    setItems([]);
  };

  // Renderización de la Pagina
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
                    {a.nombre} (Proveedor: {a.nombreProveedor})
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
