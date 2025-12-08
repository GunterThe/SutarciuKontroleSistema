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
public class IrasasController : ControllerBase
{
    private readonly AppDbContext _db;
    public IrasasController(AppDbContext db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Irasas>))]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Irasas
            .AsNoTracking()
            .Select(i => new {
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
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Irasas))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin)
        {
            var hasAccess = await _db.IrasasNaudotojas.AnyAsync(x => x.IrasasId == id && x.NaudotojasId == currentUserId);
            if (!hasAccess) return Forbid();
        }
        var item = await _db.Irasas
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(i => new
            {
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
            })
            .FirstOrDefaultAsync();

        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("{id}/Archive")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Irasas>> ArchiveIrasas(int id)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin)
        {
            var hasAccess = await _db.IrasasNaudotojas.AnyAsync(x => x.IrasasId == id && x.NaudotojasId == currentUserId);
            if (!hasAccess) return Forbid();
        }
        var irasas = await _db.Irasas.FindAsync(id);
        if(irasas == null)
        {
            return NotFound();
        }

        irasas.Archyvuotas = true;
        _db.Entry(irasas).State = EntityState.Modified;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/Naudotojai")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Naudotojas>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Irasas>> GetIrasasNaudotojai(int id)
    {
        var irasas = await _db.Irasas
        .Include(i => i.Naudotojai.Where(inu => inu.Prekes_Adminas))
            .ThenInclude(inu => inu.Naudotojas)
        .FirstOrDefaultAsync(i => i.Id == id);

        if (irasas == null)
        {
            return NotFound();
        }

        var Naudotojai = irasas.Naudotojai.Select(n => new
        {
            n.Naudotojas!.Id,
            n.Naudotojas!.Vardas,
            n.Naudotojas!.Pavarde,
        });

        return Ok(Naudotojai);
    }

    [HttpGet("{id}/Viewers")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<object>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetIrasasViewers(int id)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin)
        {
            var hasAccess = await _db.IrasasNaudotojas.AnyAsync(x => x.IrasasId == id && x.NaudotojasId == currentUserId);
            if (!hasAccess) return Forbid();
        }

        var viewers = await _db.IrasasNaudotojas
            .AsNoTracking()
            .Where(x => x.IrasasId == id)
            .Include(x => x.Naudotojas)
            .Select(x => new {
                Id = x.Naudotojas!.Id,
                Vardas = x.Naudotojas!.Vardas,
                Pavarde = x.Naudotojas!.Pavarde,
                El_pastas = x.Naudotojas!.El_pastas
            })
            .ToListAsync();

        return Ok(viewers);
    }


    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Irasas))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(Irasas model)
    {
        model.Tag = null;
        model.Naudotojai = model.Naudotojai ?? new List<IrasasNaudotojas>();
        model.Comments = model.Comments ?? new List<Comment>();

        // Save the Irasas first
        _db.Irasas.Add(model);
        await _db.SaveChangesAsync();

        // Link the creator as an IrasasNaudotojas so they have access (and management rights)
        var currentUserId = User.GetUserId();
        if (!string.IsNullOrEmpty(currentUserId))
        {
            var assignee = new IrasasNaudotojas
            {
                IrasasId = model.Id,
                NaudotojasId = currentUserId,
                Prekes_Adminas = true
            };
            _db.IrasasNaudotojas.Add(assignee);
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(Get), new { id = model.Id }, model);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, Irasas updated)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin)
        {
            var hasAccess = await _db.IrasasNaudotojas.AnyAsync(x => x.IrasasId == id && x.NaudotojasId == currentUserId);
            if (!hasAccess) return Forbid();
        }
        var existing = await _db.Irasas.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Id_dokumento = updated.Id_dokumento;
        existing.Pavadinimas = updated.Pavadinimas;
        existing.TagID = updated.TagID;
        existing.Isigaliojimo_data = updated.Isigaliojimo_data;
        existing.Pabaigos_data = updated.Pabaigos_data;
        existing.Dienos_pries = updated.Dienos_pries;
        existing.Dienu_daznumas = updated.Dienu_daznumas;
        existing.Archyvuotas = updated.Archyvuotas;
        existing.Kita_data = updated.Kita_data;
        existing.Pastas_kreiptis = updated.Pastas_kreiptis;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _db.Irasas.FindAsync(id);
        if (existing == null) return NotFound();
        _db.Irasas.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
