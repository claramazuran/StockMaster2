export default function CalcularModeloInventario (articuloSeleccionado, tipoSeleccionado, formData = null, articuloProveedor, modeloSeleccionado, data = null) {
    const Z = 1.65; // Z para un nivel de servicio del 95%
    
    //si estoy dando de alta un modelo de inventario
    if (articuloSeleccionado && tipoSeleccionado && formData && articuloProveedor) {
    
        if(tipoSeleccionado.nombre === "Modelo de Lote Fijo") {
            const cantidadAPedirOptima = Math.ceil(Math.sqrt((2 * articuloSeleccionado.demandaArticulo * articuloProveedor.costoPedidoArticulo)/articuloSeleccionado.costoAlmacenamientoArticulo));
            const stockSeguridad = Math.ceil(Z * formData.desviacion);
            const puntoPedido = Math.ceil((articuloSeleccionado.demandaArticulo) * articuloProveedor.demoraEntrega + stockSeguridad);
            
            const newModelo = {
                articuloId: articuloSeleccionado.id,
                tipoModeloId: tipoSeleccionado.id,
                cantidadAPedirOptima: cantidadAPedirOptima,
                puntoPedido: puntoPedido,
                periodoRevision: 0,
                desviacionEstandar: formData.desviacion,
                stockSeguridad: stockSeguridad,
                };
            
            return newModelo;

        } else if(tipoSeleccionado.nombre === "Modelo de Periodo Fijo") {
            const stockSeguridad = Math.ceil(Z * formData.desviacion * (parseFloat(formData.periodoRevision) + articuloProveedor.demoraEntrega));
            const cantidadAPedirOptima = Math.ceil(articuloSeleccionado.demandaArticulo * (parseFloat(formData.periodoRevision) + articuloProveedor.demoraEntrega) + stockSeguridad - (articuloSeleccionado.stockActualArticulo || 0));
            const newModelo = {
                articuloId: articuloSeleccionado.id,
                tipoModeloId: tipoSeleccionado.id,
                cantidadAPedirOptima: cantidadAPedirOptima,
                puntoPedido: 0,
                periodoRevision: formData.periodoRevision,
                desviacionEstandar: formData.desviacion,
                stockSeguridad: stockSeguridad,
                };

            return newModelo;
        }
    }
    //si estoy actualizando un modelo de inventario
    if (articuloSeleccionado && tipoSeleccionado && data && articuloProveedor) {
        if(tipoSeleccionado.nombre === "Modelo de Lote Fijo") {
            // Debug: mostrar valores antes del cálculo
            if (typeof window !== 'undefined') {
                window.alert(
                    'DEBUG Lote Fijo (actualización):\n' +
                    'demandaArticulo: ' + articuloSeleccionado.demandaArticulo + '\n' +
                    'costoPedidoArticulo: ' + articuloProveedor.costoPedidoArticulo + '\n' +
                    'costoAlmacenamientoArticulo: ' + articuloSeleccionado.costoAlmacenamientoArticulo
                );
            }
            const cantidadAPedirOptima = Math.ceil(Math.sqrt((2 * articuloSeleccionado.demandaArticulo * articuloProveedor.costoPedidoArticulo)/articuloSeleccionado.costoAlmacenamientoArticulo));
            const stockSeguridad = Math.ceil(Z * data.desviacionEstandar);
            const puntoPedido = Math.ceil((articuloSeleccionado.demandaArticulo) * articuloProveedor.demoraEntrega + stockSeguridad);

            const updatedModelo = {
                ...modeloSeleccionado,
                cantidadAPedirOptima: cantidadAPedirOptima,
                puntoPedido: puntoPedido,
                periodoRevision: 0,
                desviacionEstandar: data.desviacionEstandar,
                stockSeguridad: stockSeguridad,
            };

            return updatedModelo;

        } else if(tipoSeleccionado.nombre === "Modelo de Periodo Fijo") {
            // Debug: mostrar valores antes del cálculo
            console.log('DEBUG CalcularModeloInventario:', {
                demandaArticulo: articuloSeleccionado.demandaArticulo,
                periodoRevision: data.periodoRevision,
                demoraEntrega: articuloProveedor.demoraEntrega,
                desviacionEstandar: data.desviacionEstandar,
                stockActualArticulo: articuloSeleccionado.stockActualArticulo
            });
            const stockSeguridad = Math.ceil(Z * data.desviacionEstandar * (parseFloat(data.periodoRevision) + articuloProveedor.demoraEntrega));
            const cantidadAPedirOptima = Math.ceil(articuloSeleccionado.demandaArticulo * (parseFloat(data.periodoRevision) + articuloProveedor.demoraEntrega) + stockSeguridad - (articuloSeleccionado.stockActualArticulo || 0));
            const updatedModelo = {
                ...modeloSeleccionado,
                cantidadAPedirOptima: cantidadAPedirOptima,
                puntoPedido: 0,
                periodoRevision: data.periodoRevision,
                desviacionEstandar: data.desviacionEstandar,
                stockSeguridad: stockSeguridad,
            };

            return updatedModelo;
        }
    }
    //si se llama solo para recalcular con un nuevo proveedor predeterminado (sin formData ni data)
    if (articuloSeleccionado && tipoSeleccionado && articuloProveedor && !formData && !data) {
        if(tipoSeleccionado.nombre === "Modelo de Lote Fijo") {
            const cantidadAPedirOptima = Math.ceil(Math.sqrt((2 * articuloSeleccionado.demandaArticulo * articuloProveedor.costoPedidoArticulo)/articuloSeleccionado.costoAlmacenamientoArticulo));
            const stockSeguridad = Math.ceil(Z * (articuloProveedor.desviacionEstandar || 1));
            const puntoPedido = Math.ceil((articuloSeleccionado.demandaArticulo) * articuloProveedor.demoraEntrega + stockSeguridad);
            return {
                ...modeloSeleccionado,
                cantidadAPedirOptima,
                puntoPedido,
                periodoRevision: 0,
                desviacionEstandar: articuloProveedor.desviacionEstandar || 1,
                stockSeguridad
            };
        } else if(tipoSeleccionado.nombre === "Modelo de Periodo Fijo") {
            const periodoRevision = articuloProveedor.periodoRevision || 7;
            const stockSeguridad = Math.ceil(Z * (articuloProveedor.desviacionEstandar || 1) * (parseFloat(periodoRevision) + articuloProveedor.demoraEntrega));
            const cantidadAPedirOptima = Math.ceil(articuloSeleccionado.demandaArticulo * (parseFloat(periodoRevision) + articuloProveedor.demoraEntrega) + stockSeguridad - (articuloSeleccionado.stockActualArticulo || 0));
            return {
                ...modeloSeleccionado,
                cantidadAPedirOptima,
                puntoPedido: 0,
                periodoRevision,
                desviacionEstandar: articuloProveedor.desviacionEstandar || 1,
                stockSeguridad
            };
        }
    }
}