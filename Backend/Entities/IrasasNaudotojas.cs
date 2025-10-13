using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class IrasasNaudotojas
{
    [ForeignKey("Irasas")]
    public int IrasasId { get; set; }

    [ForeignKey("Naudotojas")]
    public string NaudotojasId { get; set; } = string.Empty;

    public bool Prekes_Adminas { get; set; } = false;

    public Irasas Irasas { get; set; } = null!;
    public Naudotojas Naudotojas { get; set; } = null!;
}