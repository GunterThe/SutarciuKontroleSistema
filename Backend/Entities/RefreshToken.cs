using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public DateTime Expires { get; set; }

    public DateTime? Revoked { get; set; }

    [Required]
    public string NaudotojasId { get; set; } = string.Empty;

    [JsonIgnore]
    public Naudotojas? Naudotojas { get; set; }

    public bool IsActive => Revoked == null && DateTime.UtcNow < Expires;
}
