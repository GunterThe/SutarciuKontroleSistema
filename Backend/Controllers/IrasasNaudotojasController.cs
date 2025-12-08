using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Auth;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IrasasNaudotojasController : ControllerBase
{
    private readonly AppDbContext _db;
    public IrasasNaudotojasController(AppDbContext db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<IrasasNaudotojas>))]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll() => Ok(await _db.IrasasNaudotojas.AsNoTracking().ToListAsync());

    [HttpGet("{irasasId}/{naudotojasId}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IrasasNaudotojas))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int irasasId, string naudotojasId)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin && !string.Equals(naudotojasId, currentUserId, StringComparison.Ordinal))
        {
            return Forbid();
        }
        var item = await _db.IrasasNaudotojas.FindAsync(irasasId, naudotojasId);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(IrasasNaudotojas))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] IrasasNaudotojas model)
    {
        _db.IrasasNaudotojas.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { irasasId = model.IrasasId, naudotojasId = model.NaudotojasId }, model);
    }

    [HttpPut("{irasasId}/{naudotojasId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int irasasId, string naudotojasId, [FromBody] IrasasNaudotojas updated)
    {
        var existing = await _db.IrasasNaudotojas.FindAsync(irasasId, naudotojasId);
        if (existing == null) return NotFound();
        existing.Prekes_Adminas = updated.Prekes_Adminas;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{irasasId}/{naudotojasId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int irasasId, string naudotojasId)
    {
        var existing = await _db.IrasasNaudotojas.FindAsync(irasasId, naudotojasId);
        if (existing == null) return NotFound();
        _db.IrasasNaudotojas.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
