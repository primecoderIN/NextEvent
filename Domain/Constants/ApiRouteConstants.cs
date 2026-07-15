namespace Domain.Constants;

public static class ApiRouteConstants
{
    public static class Account
    {
        public const string Base = "api/account";
        public const string Register = "register";
        public const string Login = "login";
        public const string RefreshToken = "refresh-token";
        public const string Logout = "logout";
    }

    public static class Ai
    {
        public const string Base = "api/ai";
        public const string GenerateDescription = "generate-description";
    }

    public static class Events
    {
        public const string Base = "api/events";
        public const string Id = "{id:guid}";
        public const string Update = "{id:guid}";
        public const string Delete = "{id:guid}";
    }

    public static class Categories
    {
        public const string Base = "api/categories";
        public const string Suggest = "suggest";           // POST — submit a suggestion
        public const string Suggestions = "suggestions";   // GET  — list suggestions (admin)
        public const string Approve = "{id:guid}/approve";
        public const string Reject = "{id:guid}/reject";
    }

    public static class Organizations
    {
        public const string Base    = "api/organizations";
        public const string Id      = "{id:guid}";
        public const string Approve = "{id:guid}/approve";
    }
}
