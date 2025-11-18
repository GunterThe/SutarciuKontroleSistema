using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public record RegisterRequest(string Vardas, string Pavarde, DateTime Gimimo_data, string El_pastas, string Password);
    public record AuthResponse(string AccessToken, string RefreshToken);
    public record LoginRequest(string El_pastas, string Password);
    public record RefreshRequest(string RefreshToken);

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        if (await _db.Naudotojas.AnyAsync(u => u.El_pastas == req.El_pastas))
        {
            return Conflict(new { message = "Email already registered" });
        }

        var user = new Naudotojas
        {
            Vardas = req.Vardas,
            Pavarde = req.Pavarde,
            Gimimo_data = req.Gimimo_data,
            El_pastas = req.El_pastas,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        _db.Naudotojas.Add(user);
        var refresh = _tokenService.CreateRefreshToken(user);
        user.RefreshToken.Add(refresh);
        await _db.SaveChangesAsync();

        var access = _tokenService.CreateAccessToken(user);
        return Ok(new AuthResponse(access, refresh.Token));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        // No need to load RefreshToken collection here; avoiding it prevents provider type mismatches
        var user = await _db.Naudotojas.FirstOrDefaultAsync(u => u.El_pastas == req.El_pastas);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }
        var refresh = _tokenService.CreateRefreshToken(user);
        // Add the refresh token directly; NaudotojasId is set in the token factory
        _db.RefreshToken.Add(refresh);
        await _db.SaveChangesAsync();
        var access = _tokenService.CreateAccessToken(user);
        return Ok(new AuthResponse(access, refresh.Token));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest req)
    {
        var tokenEntity = await _db.RefreshToken.Include(r => r.Naudotojas).FirstOrDefaultAsync(r => r.Token == req.RefreshToken);
        if (tokenEntity == null || !tokenEntity.IsActive)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }
        // Revoke old
        tokenEntity.Revoked = DateTime.UtcNow;

        var user = tokenEntity.Naudotojas!;
        var newRefresh = _tokenService.CreateRefreshToken(user);
        user.RefreshToken.Add(newRefresh);
        await _db.SaveChangesAsync();
        var access = _tokenService.CreateAccessToken(user);
        return Ok(new AuthResponse(access, newRefresh.Token));
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<IActionResult> Revoke(RefreshRequest req)
    {
        var tokenEntity = await _db.RefreshToken.FirstOrDefaultAsync(r => r.Token == req.RefreshToken);
        if (tokenEntity == null || !tokenEntity.IsActive) return NotFound();
        tokenEntity.Revoked = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("token")]
    [Authorize]
    [Authorize(Policy = "AdminOnly")]
    public ActionResult<object> CurrentToken()
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return BadRequest(new { message = "No bearer token provided" });
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        JwtSecurityToken? jwt = null;
        try
        {
            var handler = new JwtSecurityTokenHandler();
            jwt = handler.ReadJwtToken(token);
        }
        catch
        {
            return BadRequest(new { message = "Invalid JWT format" });
        }

        var claims = jwt.Claims.Select(c => new { c.Type, c.Value });
        return Ok(new { token, claims });
    }

    
}
