import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📦 Sistema de Stock - Hub Principal</h2>

      {/* ARTICULOS */}
      <h5>📁 Artículos</h5>
      <div className="d-grid gap-2 mb-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/add-articulo")}>➕ Agregar Artículo</button>
        <button className="btn btn-outline-warning" onClick={() => navigate("/update-articulo")}>✏️ Editar Artículo</button>
        <button className="btn btn-outline-danger" onClick={() => navigate("/delete-articulo")}>🗑️ Eliminar Artículo</button>
      </div>

      {/* PROVEEDORES */}
      <h5>📁 Proveedores</h5>
      <div className="d-grid gap-2 mb-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/add-proveedor")}>➕ Agregar Proveedor</button>
        <button className="btn btn-outline-warning" onClick={() => navigate("/update-proveedor")}>✏️ Editar Proveedor</button>
        <button className="btn btn-outline-danger" onClick={() => navigate("/delete-proveedor")}>🗑️ Eliminar Proveedor</button>
      </div>

      {/* PRODUCTO-PROVEEDOR */}
      <h5>📁 Tipos de Producto (Producto-Proveedor)</h5>
      <div className="d-grid gap-2 mb-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/add-producto-proveedor")}>➕ Agregar Tipo</button>
        <button className="btn btn-outline-warning" onClick={() => navigate("/update-producto-proveedor")}>✏️ Editar Tipo</button>
        <button className="btn btn-outline-danger" onClick={() => navigate("/delete-producto-proveedor")}>🗑️ Eliminar Tipo</button>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/ver-producto-proveedor")}>📋 Ver Tipos de Producto y Stock</button>
      </div>

      {/* ORDEN DE COMPRA */}
      <h5>📁 Orden de Compra</h5>
      <div className="d-grid gap-2 mb-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/add-orden-compra")}>➕ Nueva Orden</button>
        <button className="btn btn-outline-warning" onClick={() => navigate("/update-orden-compra")}>✏️ Editar Orden</button>
        <button className="btn btn-outline-danger" onClick={() => navigate("/delete-orden-compra")}>🗑️ Eliminar Orden</button>
        <button className="btn btn-outline-info" onClick={() => navigate("/update-estado-orden-compra")}>🔄 Cambiar Estado</button>
      </div>

      {/* DETALLE ORDEN */}
      <h5>📁 Detalle Orden de Compra</h5>
      <div className="d-grid gap-2 mb-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/add-detalle-orden")}>➕ Agregar Detalle</button>
        <button className="btn btn-outline-warning" onClick={() => navigate("/update-detalle-orden")}>✏️ Editar Detalle</button>
        <button className="btn btn-outline-danger" onClick={() => navigate("/delete-detalle-orden")}>🗑️ Eliminar Detalle</button>
      </div>

      {/* VENTAS */}
      <h5>📁 Ventas</h5>
      <div className="d-grid gap-2 mb-4">
        <button className="btn btn-outline-primary" onClick={() => navigate("/add-venta")}>➕ Registrar Venta</button>
        <button className="btn btn-outline-warning" onClick={() => navigate("/update-venta")}>✏️ Editar Venta</button>
        <button className="btn btn-outline-danger" onClick={() => navigate("/delete-venta")}>🗑️ Eliminar Venta</button>
      </div>

      {/* MODELO DE INVENTARIO */}
      <h5>📁 Modelos de Inventario</h5>
      <div className="d-grid gap-2 mb-5">
        <button className="btn btn-outline-primary" onClick={() => navigate("/add-modelo-inventario")}>➕ Agregar Modelo</button>
        <button className="btn btn-outline-warning" onClick={() => navigate("/update-modelo-inventario")}>✏️ Editar Modelo</button>
        <button className="btn btn-outline-danger" onClick={() => navigate("/delete-modelo-inventario")}>🗑️ Eliminar Modelo</button>
      </div>
    </div>
  );
}
