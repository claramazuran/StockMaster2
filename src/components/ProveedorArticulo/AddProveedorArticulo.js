import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import db from "../../firebase";

export default function AddProveedorArticulo() {
  const [articulos, setArticulos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const proveedorIdInicial = location.state?.idProveedor || "";

  const [articuloId, setArticuloId] = useState("");
  const [proveedorId, setProveedorId] = useState(proveedorIdInicial);
  const [precio, setPrecio] = useState("");
  const [cargosPedido, setCargosPedido] = useState("");
  const [demora, setDemora] = useState("");
  const [esPredeterminado, setEsPredeterminado] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const artSnap = await getDocs(collection(db, "Articulos"));
      const provSnap = await getDocs(collection(db, "Proveedor"));

      setArticulos(artSnap.docs.map((d) => ({ id: d.id, nombre: d.data().nombreArticulo })));
      setProveedores(provSnap.docs.map((d) => ({ id: d.id, nombre: d.data().nombreProveedor })));
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!articuloId || !proveedorId) return alert("Seleccioná artículo y proveedor");

    const ref = doc(db, "Articulos", articuloId, "ProveedorArticulo", proveedorId);
    await setDoc(ref, {
      CargosPedido: parseInt(cargosPedido),
      DemoraEntrega: parseInt(demora),
      esProveedorPredeterminado: esPredeterminado,
      fechaHoraAltaProveedorArticulo: new Date(),
      fechaHoraBajaProveedorArticulo: null,
      PrecioUnitario: parseFloat(precio),
      codProveedor: proveedorId,
    });

    alert("Proveedor-Articulo agregado correctamente");

    if (proveedorIdInicial) {
      navigate("/");
    } else {
      setProveedorId("");
    }
    setPrecio("");
    setCargosPedido("");
    setDemora("");
    setEsPredeterminado(false);
  };

  return (
    <form onSubmit={handleSubmit} className="container my-4">
      <h4>➕ Agregar Proveedor a un Artículo</h4>

      {proveedorIdInicial && (
        <div className="alert alert-warning">
          Este proveedor fue creado recién. Debe asociarse a al menos un artículo antes de continuar.
        </div>
      )}

      <select
        className="form-select mb-3"
        value={articuloId}
        onChange={(e) => setArticuloId(e.target.value)}
      >
        <option value="">Seleccionar artículo</option>
        {articulos.map((a) => (
          <option key={a.id} value={a.id}>{a.nombre}</option>
        ))}
      </select>

      {!proveedorIdInicial && (
        <select
          className="form-select mb-3"
          value={proveedorId}
          onChange={(e) => setProveedorId(e.target.value)}
        >
          <option value="">Seleccionar proveedor</option>
          {proveedores.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      )}

      <input
        type="number"
        className="form-control mb-2"
        placeholder="Precio unitario"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />
      <input
        type="number"
        className="form-control mb-2"
        placeholder="Cargos de pedido"
        value={cargosPedido}
        onChange={(e) => setCargosPedido(e.target.value)}
      />
      <input
        type="number"
        className="form-control mb-2"
        placeholder="Demora en entrega (días)"
        value={demora}
        onChange={(e) => setDemora(e.target.value)}
      />
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          checked={esPredeterminado}
          onChange={(e) => setEsPredeterminado(e.target.checked)}
          id="predeterminado"
        />
        <label className="form-check-label" htmlFor="predeterminado">
          Proveedor Predeterminado
        </label>
      </div>

      <button className="btn btn-success">Guardar</button>
    </form>
  );
}
