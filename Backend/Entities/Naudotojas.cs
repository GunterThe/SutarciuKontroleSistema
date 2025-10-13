using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class Naudotojas
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [StringLength(30)]
    public string Vardas { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Pavarde { get; set; } = string.Empty;

    [Required]
    public DateTime Gimimo_data { get; set; }

    [Required]
    [StringLength(100)]
    public string El_pastas { get; set; } = string.Empty;

    public bool Adminas { get; set; } = false;

    public ICollection<IrasasNaudotojas> Irasai { get; set; } = new List<IrasasNaudotojas>();
}