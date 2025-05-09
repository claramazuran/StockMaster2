import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📦 Sistema de Stock - Hub Principal</h2>
      <div className="d-grid gap-3">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-producto")}
        >
          ➕ Agregar Producto
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-proveedor")}
        >
          🧾 Agregar Proveedor
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-producto-proveedor")}
        >
          🧃 Agregar Tipo de Producto (productoProveedor)
        </button>
        <button
  className="btn btn-secondary"
  onClick={() => navigate("/ver-producto-proveedor")}
>
  📋 Ver Tipos de Producto y Stock
</button>

      </div>
    </div>
  );
}
