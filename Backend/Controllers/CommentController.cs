using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class CommentController : ControllerBase
{
    private readonly AppDbContext _db;
    public CommentController(AppDbContext db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Comment>))]
    public async Task<IActionResult> GetAll() => Ok(await _db.Comment.AsNoTracking().ToListAsync());

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Comment))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _db.Comment.FindAsync(id);
        if (c == null) 
            return NotFound();
        return Ok(c);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Comment))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(Comment model)
    {
        model.Irasas = await _db.Irasas.FindAsync(model.IrasasId);

        if (model.Irasas == null)
            return BadRequest("Invalid IrasasId");
        
        model.Naudotojas = await _db.Naudotojas.FindAsync(model.NaudotojasId);

        if (model.Naudotojas == null)
            return BadRequest("Invalid NaudotojasId");

        _db.Comment.Add(model);
        
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = model.Id }, model);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, Comment updated)
    {
        var existing = await _db.Comment.FindAsync(id);

        if (existing == null)
            return NotFound();
        
        existing.CommentText = updated.CommentText;
        existing.IrasasId = updated.IrasasId;
        existing.NaudotojasId = updated.NaudotojasId;
        existing.Irasas = await _db.Irasas.FindAsync(updated.IrasasId);

        if (existing.Irasas == null) 
            return BadRequest("Invalid IrasasId");

        existing.Naudotojas = await _db.Naudotojas.FindAsync(updated.NaudotojasId);
        
        if (existing.Naudotojas == null) 
            return BadRequest("Invalid NaudotojasId");
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _db.Comment.FindAsync(id);
        if (existing == null)
            return NotFound();
            
        _db.Comment.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
