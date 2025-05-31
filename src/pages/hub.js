import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", width: "100vw", position: "fixed", top: 0, left: 0, background: "linear-gradient(135deg, #f8fafc 0%, #e2eafc 100%)", zIndex: -1 }}>
      <div className="container py-5" style={{ position: "relative", zIndex: 1 }}>
        <div className="text-center mb-5">
          <h2 className="fw-bold display-5 mb-2" style={{ letterSpacing: "1px" }}>
            <span role="img" aria-label="box">📦</span> Sistema de Stock
          </h2>
          <p className="lead text-secondary">Hub Principal</p>
        </div>

        <div className="row g-4">
          {/* ARTICULOS */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <span role="img" aria-label="articulos">📁</span> Artículos
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => navigate("/add-articulo")}>➕ Agregar Artículo</button>
                  <button className="btn btn-warning text-white" onClick={() => navigate("/update-articulo")}>✏️ Editar Artículo</button>
                  <button className="btn btn-danger" onClick={() => navigate("/delete-articulo")}>🗑️ Eliminar Artículo</button>
                </div>
              </div>
            </div>
          </div>

          {/* PROVEEDORES */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <span role="img" aria-label="proveedores">🤝</span> Proveedores
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => navigate("/add-proveedor")}>➕ Agregar Proveedor</button>
                  <button className="btn btn-warning text-white" onClick={() => navigate("/update-proveedor")}>✏️ Editar Proveedor</button>
                  <button className="btn btn-danger" onClick={() => navigate("/delete-proveedor")}>🗑️ Eliminar Proveedor</button>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTO-PROVEEDOR */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <span role="img" aria-label="tipos">🧩</span> Tipos de Producto
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => navigate("/add-producto-proveedor")}>➕ Agregar Tipo</button>
                  <button className="btn btn-warning text-white" onClick={() => navigate("/update-producto-proveedor")}>✏️ Editar Tipo</button>
                  <button className="btn btn-danger" onClick={() => navigate("/delete-producto-proveedor")}>🗑️ Eliminar Tipo</button>
                  <button className="btn btn-secondary" onClick={() => navigate("/ver-producto-proveedor")}>📋 Ver Tipos y Stock</button>
                </div>
              </div>
            </div>
          </div>

          {/* ORDEN DE COMPRA */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <span role="img" aria-label="orden">📝</span> Orden de Compra
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => navigate("/add-orden-compra")}>➕ Nueva Orden</button>
                  <button className="btn btn-warning text-white" onClick={() => navigate("/update-orden-compra")}>✏️ Editar Orden</button>
                  <button className="btn btn-danger" onClick={() => navigate("/delete-orden-compra")}>🗑️ Eliminar Orden</button>
                  <button className="btn btn-info text-white" onClick={() => navigate("/update-estado-orden-compra")}>🔄 Cambiar Estado</button>
                </div>
              </div>
            </div>
          </div>

          {/* VENTAS */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <span role="img" aria-label="ventas">💸</span> Ventas
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => navigate("/add-venta")}>➕ Registrar Venta</button>
                  <button className="btn btn-warning text-white" onClick={() => navigate("/update-venta")}>✏️ Editar Venta</button>
                  <button className="btn btn-danger" onClick={() => navigate("/delete-venta")}>🗑️ Eliminar Venta</button>
                </div>
              </div>
            </div>
          </div>

          {/* MODELO DE INVENTARIO */}
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <span role="img" aria-label="modelo">📊</span> Modelos de Inventario
                </h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={() => navigate("/add-modelo-inventario")}>➕ Agregar Modelo</button>
                  <button className="btn btn-warning text-white" onClick={() => navigate("/update-modelo-inventario")}>✏️ Editar Modelo</button>
                  <button className="btn btn-danger" onClick={() => navigate("/delete-modelo-inventario")}>🗑️ Eliminar Modelo</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
