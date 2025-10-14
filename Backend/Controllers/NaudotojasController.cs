using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class NaudotojasController : ControllerBase
{
    private readonly AppDbContext _db;
    public NaudotojasController(AppDbContext db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Naudotojas>))]
    public async Task<IActionResult> GetAll() => Ok(await _db.Naudotojas.AsNoTracking().ToListAsync());

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Naudotojas))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(string id)
    {
        var user = await _db.Naudotojas.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpGet("{id}/Irasai")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<IrasasNaudotojas>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<IrasasNaudotojas>>> GetNaudotojasIrasai(string id, bool Archyvuotas)
    {
        var naudotojas = await _db.Naudotojas
            .Include(n => n.Irasai.Where(inu => inu.Irasas.Archyvuotas == Archyvuotas))
                .ThenInclude(inu => inu.Irasas)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (naudotojas == null)
        {
            return NotFound();
        }

        return Ok(naudotojas.Irasai);
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
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _db.Naudotojas.FindAsync(id);
        if (existing == null) return NotFound();
        _db.Naudotojas.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
