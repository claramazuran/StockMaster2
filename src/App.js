import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hub from "./pages/hub";
import AddProducto from "./components/Producto/AddProducto";
import AddProveedor from "./components/Proveedor/AddProveedor";
import AddProductoProveedor from "./components/Producto/AddProductoProveedor";
import VerProductoProveedor from "./components/Producto/VerProductoProveedor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/add-producto" element={<AddProducto />} />
        <Route path="/add-proveedor" element={<AddProveedor />} />
        <Route path="/add-producto-proveedor" element={<AddProductoProveedor />} />
        <Route path="/ver-producto-proveedor" element={<VerProductoProveedor />} />
      </Routes>
    </Router>
  );
}

export default App;
