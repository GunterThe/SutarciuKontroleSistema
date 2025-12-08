using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Auth;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NaudotojasController : ControllerBase
{
    private readonly AppDbContext _db;
    public NaudotojasController(AppDbContext db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Naudotojas>))]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll() => Ok(await _db.Naudotojas.AsNoTracking().ToListAsync());

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Naudotojas))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(string id)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin && !string.Equals(id, currentUserId, StringComparison.Ordinal))
        {
            return Forbid();
        }
        var user = await _db.Naudotojas.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpGet("{id}/Irasai")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Irasas>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetNaudotojasIrasai(string id, int Archyvuotas)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin && !string.Equals(id, currentUserId, StringComparison.Ordinal))
        {
            return Forbid();
        }
        var naudotojas = await _db.Naudotojas
            .Include(n => n.Irasai.Where(inu => inu.Irasas != null && (inu.Irasas.Archyvuotas == (Archyvuotas == 1))))
                .ThenInclude(inu => inu.Irasas)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (naudotojas == null)
        {
            return NotFound();
        }

        var irasai = naudotojas.Irasai
            .Where(x => x.Irasas != null)
            .Select(x => x.Irasas!)
            .ToList();

        // project to a lightweight DTO and represent Archyvuotas as 0/1 to match tinyint storage
        var projected = irasai.Select(i => new {
            i.Id,
            i.Id_dokumento,
            i.Pavadinimas,
            i.TagID,
            i.Isigaliojimo_data,
            i.Pabaigos_data,
            i.Dienos_pries,
            i.Dienu_daznumas,
            Archyvuotas = i.Archyvuotas ? 1 : 0,
            i.Kita_data,
            i.Pastas_kreiptis
        });

        return Ok(projected);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Naudotojas))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(Naudotojas model)
    {
        _db.Naudotojas.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = model.Id }, model);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, Naudotojas updated)
    {
        var existing = await _db.Naudotojas.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Vardas = updated.Vardas;
        existing.Pavarde = updated.Pavarde;
        existing.Gimimo_data = updated.Gimimo_data;
        existing.El_pastas = updated.El_pastas;
        existing.Adminas = updated.Adminas;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _db.Naudotojas.FindAsync(id);
        if (existing == null) return NotFound();
        _db.Naudotojas.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
