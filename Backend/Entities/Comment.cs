using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Comment
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(500)]
    public string CommentText { get; set; } = string.Empty;

    [ForeignKey("Irasas")]
    public int IrasasId { get; set; }
    [ForeignKey("Naudotojas")]
    public string NaudotojasId { get; set; } = string.Empty;

    public Irasas Irasas { get; set; } = null!;
    public Naudotojas Naudotojas { get; set; } = null!;

}