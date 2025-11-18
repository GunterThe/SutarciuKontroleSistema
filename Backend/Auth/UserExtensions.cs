using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Auth
{
    public static class UserExtensions
    {
        public static string? GetUserId(this ClaimsPrincipal user)
        {
            // Prefer JWT sub claim as set in TokenService
            return user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                   ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return string.Equals(user.FindFirst("admin")?.Value, bool.TrueString, StringComparison.OrdinalIgnoreCase);
        }
    }
}
