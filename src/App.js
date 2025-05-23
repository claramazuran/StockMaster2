import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hub from "./pages/hub";

// Articulos
import AddArticulo from "./components/Articulos/AddArticulo";
import UpdateArticulo from "./components/Articulos/UpdateArticulo";
import DeleteArticulo from "./components/Articulos/DeleteArticulo";

// Proveedor
import AddProveedor from "./components/Proveedor/AddProveedor";
import UpdateProveedor from "./components/Proveedor/UpdateProveedor";
import DeleteProveedor from "./components/Proveedor/DeleteProveedor";

// ProductoProveedor
import AddProductoProveedor from "./components/ProveedorArticulo/AddProveedorArticulo";
import UpdateProductoProveedor from "./components/ProveedorArticulo/UpdateProveedorArticulo";
import DeleteProductoProveedor from "./components/ProveedorArticulo/DeleteProveedorArticulo";
import VerProductoProveedor from "./components/Producto/VerProductoProveedor"; // conservás este

// Orden de compra
import AddOrdenCompra from "./components/Ordencompra/AddOrdenCompra";
import UpdateOrdenCompra from "./components/Ordencompra/UpdateOrdenCompra";
import DeleteOrdenCompra from "./components/Ordencompra/DeleteOrdenCompra";
import UpdateEstadoOrdenCompra from "./components/Ordencompra/UpdateEstadoOrdenCompra";

// Detalle orden de compra
import AddDetalleOrdenCompra from "./components/DetalleOrdenCompra/AddDetalleOrdenCompra";
import UpdateDetalleOrdenCompra from "./components/DetalleOrdenCompra/UpdateDetalleOrdenCompra";
import DeleteDetalleOrdenCompra from "./components/DetalleOrdenCompra/DeleteDetalleOrdenCompra";

// Modelo Inventario
import AddModeloInventario from "./components/ModeloInventario/AddModeloInventario";
import UpdateModeloInventario from "./components/ModeloInventario/UpdateModeloInventario";
import DeleteModeloInventario from "./components/ModeloInventario/DeleteModeloInventario";

// Venta
import AddVenta from "./components/Venta/AddVenta";
import UpdateVenta from "./components/Venta/UpdateVenta";
import DeleteVenta from "./components/Venta/DeleteVenta";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hub />} />

        {/* Articulos */}
        <Route path="/add-articulo" element={<AddArticulo />} />
        <Route path="/update-articulo" element={<UpdateArticulo />} />
        <Route path="/delete-articulo" element={<DeleteArticulo />} />

        {/* Proveedor */}
        <Route path="/add-proveedor" element={<AddProveedor />} />
        <Route path="/update-proveedor" element={<UpdateProveedor />} />
        <Route path="/delete-proveedor" element={<DeleteProveedor />} />

        {/* Producto-Proveedor */}
        <Route path="/add-producto-proveedor" element={<AddProductoProveedor />} />
        <Route path="/update-producto-proveedor" element={<UpdateProductoProveedor />} />
        <Route path="/delete-producto-proveedor" element={<DeleteProductoProveedor />} />
        <Route path="/ver-producto-proveedor" element={<VerProductoProveedor />} />

        {/* Orden de compra */}
        <Route path="/add-orden-compra" element={<AddOrdenCompra />} />
        <Route path="/update-orden-compra" element={<UpdateOrdenCompra />} />
        <Route path="/delete-orden-compra" element={<DeleteOrdenCompra />} />
        <Route path="/update-estado-orden-compra" element={<UpdateEstadoOrdenCompra />} />

        {/* Detalle de orden de compra */}
        <Route path="/add-detalle-orden" element={<AddDetalleOrdenCompra />} />
        <Route path="/update-detalle-orden" element={<UpdateDetalleOrdenCompra />} />
        <Route path="/delete-detalle-orden" element={<DeleteDetalleOrdenCompra />} />

        {/* Modelo de Inventario */}
        <Route path="/add-modelo-inventario" element={<AddModeloInventario />} />
        <Route path="/update-modelo-inventario" element={<UpdateModeloInventario />} />
        <Route path="/delete-modelo-inventario" element={<DeleteModeloInventario />} />

        {/* Ventas */}
        <Route path="/add-venta" element={<AddVenta />} />
        <Route path="/update-venta" element={<UpdateVenta />} />
        <Route path="/delete-venta" element={<DeleteVenta />} />
      </Routes>
    </Router>
  );
}

export default App;
