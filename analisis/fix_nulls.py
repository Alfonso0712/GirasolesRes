with open('backend/GirasolesRes.Application/Services/PedidoService.cs', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

old_1 = "var todosProds = await _productoRepository.ListarDisponiblesAsync(null, cancellationToken: ct);"
new_1 = "var todosProds = (await _productoRepository.ListarDisponiblesAsync(null, cancellationToken: ct)) ?? new List<Producto>();"
assert old_1 in code, 'old_1 not found'
code = code.replace(old_1, new_1)

old_2 = "var productos = await _productoRepository.ObtenerPorIdsAsync(todosProductoIds, ct);"
new_2 = "var productos = (await _productoRepository.ObtenerPorIdsAsync(todosProductoIds, ct)) ?? new List<Producto>();"
assert old_2 in code, 'old_2 not found'
code = code.replace(old_2, new_2)

with open('backend/GirasolesRes.Application/Services/PedidoService.cs', 'w', encoding='utf-8') as f:
    f.write(code)

print('Null checks added')
