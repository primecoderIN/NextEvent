namespace Application.Events.Constants;

public static class ValidationErrors
{
    public const string TitleRequired = "TITLE_REQUIRED";
    public const string DescriptionRequired = "DESCRIPTION_REQUIRED";
    public const string CategoryRequired = "CATEGORY_REQUIRED";
    public const string DateRequired = "DATE_REQUIRED";
    public const string CityRequired = "CITY_REQUIRED";
    public const string VenueRequired = "VENUE_REQUIRED";

    public const string LatitudeOutOfRange = "LATITUDE_OUT_OF_RANGE";
    public const string LongitudeOutOfRange = "LONGITUDE_OUT_OF_RANGE";
}