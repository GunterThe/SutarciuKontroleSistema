using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

public class Irasas
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(20)]
    public string Id_dokumento { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Pavadinimas { get; set; } = string.Empty;


    [Required]
    public DateTime Isigaliojimo_data { get; set; }

    [Required]
    public DateTime Pabaigos_data { get; set; }

    [Required]
    public int Dienos_pries { get; set; } = 0;

    [Required]
    public int Dienu_daznumas { get; set; } = 0;

    public bool Archyvuotas { get; set; } = false;
    public DateTime? Kita_data { get; set; }
    [Required]
    [StringLength(100)]
    public string Pastas_kreiptis { get; set; } = string.Empty;

    [ForeignKey("Tag")]
    public int TagID { get; set; }
    [JsonIgnore]
    public ICollection<IrasasNaudotojas> Naudotojai { get; set; } = new List<IrasasNaudotojas>();
    [JsonIgnore]
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    [JsonIgnore]
    public Tag? Tag { get; set; }
}