using System.ComponentModel.DataAnnotations;

namespace Application.Events.DTOs;
public class CreateEventDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public  string Category { get; set; } = string.Empty;

    public DateTime Date { get; set; }
   [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Venue { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }
}