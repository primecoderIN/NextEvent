using FluentValidation;
using MediatR;

namespace NextEvent.Shared;

/// <summary>
/// Runs FluentValidation validators before the request
/// reaches its MediatR handler.
/// </summary>
public class ValidationBehavior<TRequest, TResponse>(
    // Inject all validators registered for this request type
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        // The incoming command/query
        TRequest request,

        // Delegate to invoke the next pipeline behavior or handler
        RequestHandlerDelegate<TResponse> next,

        // Cancellation token passed through the pipeline
        CancellationToken cancellationToken)
    {
        // If no validators exist, skip validation
        // and continue to the next step
        if (!validators.Any())
            return await next();

        // Create a FluentValidation context
        // containing the request object
        var context = new ValidationContext<TRequest>(request);

        // Execute all validators asynchronously
        // and collect all validation failures
        var failures = (await Task.WhenAll(
                validators.Select(v =>
                    v.ValidateAsync(context, cancellationToken))))
            // Combine errors from all validators into one collection
            .SelectMany(result => result.Errors)

            // Remove any null entries
            .Where(f => f != null)

            // Convert to a list for further processing
            .ToList();

        // If any validation errors exist,
        // stop execution and throw an exception
        if (failures.Count != 0)
            throw new ValidationException(failures);

        // Validation passed, continue to the next
        // pipeline behavior or request handler
        return await next();
    }
}
