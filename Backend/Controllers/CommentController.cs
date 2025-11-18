using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Auth;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly AppDbContext _db;
    public CommentController(AppDbContext db) => _db = db;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<Comment>))]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll() => Ok(await _db.Comment.AsNoTracking().ToListAsync());

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Comment))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _db.Comment.FindAsync(id);
        if (c == null) 
            return NotFound();
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin)
        {
            var isAuthor = string.Equals(c.NaudotojasId, currentUserId, StringComparison.Ordinal);
            var hasAccessToIrasas = await _db.IrasasNaudotojas.AnyAsync(x => x.IrasasId == c.IrasasId && x.NaudotojasId == currentUserId);
            if (!isAuthor && !hasAccessToIrasas)
            {
                return Forbid();
            }
        }
        return Ok(c);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Comment))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(Comment model)
    {
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        // Only allow commenting on irasas the user has access to (or admin)
        var irasas = await _db.Irasas.FindAsync(model.IrasasId);
        if (irasas == null)
            return BadRequest("Invalid IrasasId");

        if (!isAdmin)
        {
            var hasAccess = await _db.IrasasNaudotojas.AnyAsync(x => x.IrasasId == model.IrasasId && x.NaudotojasId == currentUserId);
            if (!hasAccess)
            {
                return Forbid();
            }
        }

        // Force the comment author to be the current user (unless admin explicitly sets another)
        model.NaudotojasId = isAdmin && !string.IsNullOrWhiteSpace(model.NaudotojasId) ? model.NaudotojasId : currentUserId;
        model.Irasas = irasas;
        model.Naudotojas = await _db.Naudotojas.FindAsync(model.NaudotojasId);

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
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin && !string.Equals(existing.NaudotojasId, currentUserId, StringComparison.Ordinal))
        {
            return Forbid();
        }
        
        existing.CommentText = updated.CommentText;
        // Allow changing target Irasas only if admin; non-admins can only edit text
        if (isAdmin && existing.IrasasId != updated.IrasasId)
        {
            var irasas = await _db.Irasas.FindAsync(updated.IrasasId);
            if (irasas == null)
                return BadRequest("Invalid IrasasId");
            existing.IrasasId = updated.IrasasId;
            existing.Irasas = irasas;
        }

        // Never allow changing author through update for non-admins
        if (isAdmin && updated.NaudotojasId != null && updated.NaudotojasId != existing.NaudotojasId)
        {
            var user = await _db.Naudotojas.FindAsync(updated.NaudotojasId);
            if (user == null)
                return BadRequest("Invalid NaudotojasId");
            existing.NaudotojasId = updated.NaudotojasId;
            existing.Naudotojas = user;
        }
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
        var currentUserId = User.GetUserId();
        var isAdmin = User.IsAdmin();
        if (!isAdmin && !string.Equals(existing.NaudotojasId, currentUserId, StringComparison.Ordinal))
        {
            return Forbid();
        }
            
        _db.Comment.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
