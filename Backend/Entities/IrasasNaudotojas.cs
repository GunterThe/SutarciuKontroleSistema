using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

public class IrasasNaudotojas
{
    [ForeignKey("Irasas")]
    public int IrasasId { get; set; }

    [ForeignKey("Naudotojas")]
    public string NaudotojasId { get; set; } = string.Empty;

    public bool Prekes_Adminas { get; set; } = false;

    [JsonIgnore]
    public Irasas? Irasas { get; set; }

    [JsonIgnore]
    public Naudotojas? Naudotojas { get; set; }
}