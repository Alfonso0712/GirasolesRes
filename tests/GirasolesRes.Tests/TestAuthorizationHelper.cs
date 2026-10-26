using System.Reflection;
using System.Security.Claims;
using GirasolesRes.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GirasolesRes.Tests;

public static class TestAuthorizationHelper
{
    public static async Task<IActionResult> InvocarConAutorizacionAsync<TController>(
        TController controller,
        string actionMethodName,
        Func<Task<IActionResult>> action) where TController : ControllerBase
    {
        var user = controller.User;

        var classAttrs = typeof(TController).GetCustomAttributes<AuthorizeAttribute>(true);
        var method = typeof(TController).GetMethod(actionMethodName);
        var methodAttrs = method?.GetCustomAttributes<AuthorizeAttribute>(true) ?? Enumerable.Empty<AuthorizeAttribute>();
        var authAttrs = classAttrs.Concat(methodAttrs).ToList();

        if (authAttrs.Any())
        {
            if (user?.Identity?.IsAuthenticated != true)
            {
                return new ObjectResult(new { success = false, message = "No autorizado o sesión vencida. Inicie sesión para continuar." })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
            }

            foreach (var attr in authAttrs)
            {
                if (!string.IsNullOrWhiteSpace(attr.Roles))
                {
                    var allowedRoles = attr.Roles.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
                    var userRoles = user.FindAll(ClaimTypes.Role).Select(c => c.Value);
                    if (!allowedRoles.Any(r => userRoles.Any(ur => string.Equals(ur, r, StringComparison.OrdinalIgnoreCase))))
                    {
                        return new ObjectResult(new { success = false, message = MensajesCatalogo.MSG_39, error = MensajesCatalogo.MSG_39 })
                        {
                            StatusCode = StatusCodes.Status403Forbidden
                        };
                    }
                }
            }
        }

        return await action();
    }
}
