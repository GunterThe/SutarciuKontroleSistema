using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TagController : ControllerBase
{
    private readonly AppDbContext _db;
    public TagController(AppDbContext db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Tag>))]
    public async Task<IActionResult> GetAll() => Ok(await _db.Tag.AsNoTracking().ToListAsync());

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Tag))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id)
    {
        var tag = await _db.Tag.FindAsync(id);
        if (tag == null) return NotFound();
        return Ok(tag);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Tag))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(Tag model)
    {
        _db.Tag.Add(model);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = model.Id }, model);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, Tag updated)
    {
        var existing = await _db.Tag.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = updated.Name;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _db.Tag.FindAsync(id);
        if (existing == null) return NotFound();
        _db.Tag.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/comments")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Comment>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCommentsForTag(int id)
    {
        var tagExists = await _db.Tag.AnyAsync(t => t.Id == id);
        if (!tagExists) return NotFound();

        var comments = await (
            from c in _db.Comment
            join i in _db.Irasas on c.IrasasId equals i.Id
            where i.TagID == id
            select c
        ).AsNoTracking().ToListAsync();

        return Ok(comments);
    }

}
