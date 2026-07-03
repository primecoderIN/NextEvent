using System.ComponentModel.DataAnnotations;

namespace Application.Events.DTOs;
public class CreateEventDto
{

    public string Title { get; set; } = string.Empty;


    public string Description { get; set; } = string.Empty;


    public Guid CategoryId { get; set; }

    public DateTime Date { get; set; }

    public string City { get; set; } = string.Empty;


    public string Venue { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }
}