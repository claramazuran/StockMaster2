import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import db from "../../firebase";
import CalcularModeloInventario from "./calcularModeloInventario";


export default function AddModeloInventario() {
  const [articulos, setArticulos] = useState([]);
  const [tiposModelo, setTiposModelo] = useState([]);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [modelosInventario, setModelosInventario] = useState([]);
  const [formData, setFormData] = useState({
    desviacion: '',
    periodoRevision: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const articulosSnapshot = await getDocs(collection(db, 'Articulo'));
      const tiposSnapshot = await getDocs(collection(db, 'TipoModeloInventario'));
      const modelosSnapshot = await getDocs(collection(db, 'ModeloInventario'));
      setArticulos(articulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTiposModelo(tiposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setModelosInventario(modelosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  // Función para obtener el costo del pedido del proveedor predeterminado
  async function obtenerCostoPedidoProveedorPredeterminado(articuloId) {
    const proveedoresSnap = await getDocs(
      collection(db, "Articulo", articuloId, "ArticuloProveedor")
    );
    const predeterminado = proveedoresSnap.docs.find(
      (doc) => doc.data().esProveedorPredeterminado === true
    );
    
    return predeterminado.data();
  }
  const handleSave = async (e) => {
    e.preventDefault();
    if (!articuloSeleccionado || !tipoSeleccionado) {
      alert('Debe seleccionar un artículo y un modelo');
      return;
    }
    const articuloProveedor = await obtenerCostoPedidoProveedorPredeterminado(articuloSeleccionado.id);
    if (!articuloProveedor) {
      alert('El artículo no tiene proveedor predeterminado');
      return;
    }

    if( modelosInventario.some(modelo => modelo.articuloId === articuloSeleccionado.id )) {   
      alert('El artículo ya tiene un modelo de inventario asociado');
      // Limpiar formulario
      setArticuloSeleccionado('');
      setTipoSeleccionado('');
      setFormData({ desviacion: '', periodoRevision: '' });
      return;
    }
    
    const modeloInventarioParaGuardar = CalcularModeloInventario(articuloSeleccionado, tipoSeleccionado, formData, articuloProveedor);
    
    await addDoc(collection(db, 'ModeloInventario'), modeloInventarioParaGuardar);
    alert('Modelo de Inventario agregado correctamente');
    setFormData(['',''])

    // Limpiar formulario
      setArticuloSeleccionado('');
      setTipoSeleccionado('');
      setFormData({ desviacion: '', periodoRevision: '' });
  };

  return (
    <form onSubmit={handleSave}>
      <div className="p-4">
        <h4 className="text-center mb-5">Agregar Modelo de Inventario</h4>
        
        <p>Seleccione un Articulo</p>
        <div className="form-text mb-3">
          <select className="form-select mb-5" value={articuloSeleccionado?.id || ''} onChange={e => {
            const art = articulos.find(a => a.id === e.target.value);
            setArticuloSeleccionado(art || '');
          }}>
            <option value="">Seleccione un artículo</option>
            {articulos.map(a => (
              <option key={a.id} value={a.id}>{a.nombreArticulo}</option>
            ))}
          </select>
        </div>

        <p>Seleccione un Modelo</p>
        <div className="form-text mb-3">
          <select className="form-select mb-5" value={tipoSeleccionado?.id || ''} onChange={e => {
            const tipo = tiposModelo.find(t => t.id === e.target.value);
            setTipoSeleccionado(tipo || '');
          }}>
            <option value="">Seleccione un tipo</option>
            {tiposModelo.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        {tipoSeleccionado && (
          <>
            <text>Desviación estándar</text>
            <div className="form-text mb-3">
              <input
                type="number"
                className="form-control mb-2"
                value={formData.desviacion}
                onChange={e => setFormData({ ...formData, desviacion: e.target.value })}
              />
            </div>
            {tiposModelo.find(t => t.id === tipoSeleccionado.id)?.nombre === 'Modelo de Periodo Fijo' && (
              <div className="mb-4">
                <label>Periodo de revisión en días</label>
                <input
                  type="integer"
                  className="form-control mb-2"
                  value={formData.periodoRevision}
                  onChange={e => setFormData({ ...formData, periodoRevision: e.target.value })}
                />
              </div>
            )}
          </>
        )}

        <div className="text-center mb-4 mt-5">
          <button className="btn btn-success px-4 py-2" type="submit">
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
