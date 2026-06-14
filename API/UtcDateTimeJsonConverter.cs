using System.Text.Json;
using System.Text.Json.Serialization;

/// <summary>
/// Custom JSON converter that serializes DateTime values as UTC ISO-8601 with the
/// trailing "Z" (Zulu) suffix, and deserializes incoming strings into UTC DateTimes.
///
/// Without this, System.Text.Json omits "Z" for DateTimeKind.Unspecified, which
/// causes the frontend to interpret the time as local time instead of UTC.
/// </summary>
public class UtcDateTimeJsonConverter : JsonConverter<DateTime>
{
    // Round-trip format — emits "Z" for Utc, "+HH:MM" for Local, nothing for Unspecified.
    // We force ToUniversalTime() before writing so the output is always "…Z".
    private const string Format = "yyyy-MM-ddTHH:mm:ss.fffZ";

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var raw = reader.GetString();
        if (raw is null) return default;

        // Parse and force UTC kind so downstream code is always working with UTC.
        var dt = DateTime.Parse(raw, null, System.Globalization.DateTimeStyles.RoundtripKind);
        return DateTime.SpecifyKind(dt.ToUniversalTime(), DateTimeKind.Utc);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Always write as UTC with explicit Z suffix
        writer.WriteStringValue(value.ToUniversalTime().ToString(Format));
    }
}
