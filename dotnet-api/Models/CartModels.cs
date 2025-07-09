using System.ComponentModel.DataAnnotations;

namespace dotnet_api.Models;

/// <summary>
/// Represents a shopping cart for a specific user
/// </summary>
/// <param name="Id">Unique identifier for the cart</param>
/// <param name="UserId">The user who owns this cart</param>
/// <param name="Items">List of items in the cart</param>
/// <param name="CreatedAt">When the cart was created</param>
/// <param name="UpdatedAt">When the cart was last modified</param>
/// <param name="TotalAmount">Calculated total amount of all items</param>
/// <param name="ItemCount">Total number of items in the cart</param>
public record Cart(
    int Id,
    string UserId,
    List<CartItem> Items,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    decimal TotalAmount,
    int ItemCount
);

/// <summary>
/// Represents an individual item in a shopping cart
/// </summary>
/// <param name="Id">Unique identifier for the cart item</param>
/// <param name="ProductId">Reference to the product</param>
/// <param name="ProductName">Name of the product for easy reference</param>
/// <param name="Quantity">Number of this product in the cart</param>
/// <param name="UnitPrice">Price per unit of the product</param>
/// <param name="TotalPrice">Calculated total price (Quantity * UnitPrice)</param>
public record CartItem(
    int Id,
    string ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);

/// <summary>
/// Request model for creating a new cart
/// This follows the Command Query Responsibility Segregation (CQRS) pattern
/// by separating the request model from the domain model
/// </summary>
public class CreateCartRequest
{
    [Required(ErrorMessage = "UserId is required")]
    [StringLength(100, ErrorMessage = "UserId cannot exceed 100 characters")]
    public string UserId { get; set; } = string.Empty;
}

/// <summary>
/// Request model for adding an item to the cart
/// Includes validation attributes following ASP.NET Core best practices
/// </summary>
public class AddCartItemRequest
{
    [Required(ErrorMessage = "ProductId is required")]
    [StringLength(50, ErrorMessage = "ProductId cannot exceed 50 characters")]
    public string ProductId { get; set; } = string.Empty;

    [Required(ErrorMessage = "ProductName is required")]
    [StringLength(200, ErrorMessage = "ProductName cannot exceed 200 characters")]
    public string ProductName { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "UnitPrice must be greater than 0")]
    public decimal UnitPrice { get; set; }
}

/// <summary>
/// Request model for updating cart item quantity
/// </summary>
public class UpdateCartItemRequest
{
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be 0 or greater")]
    public int Quantity { get; set; }
}

/// <summary>
/// Standard API response wrapper for consistent error handling
/// This implements the Problem Details standard (RFC 7807)
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string>? ValidationErrors { get; set; }

    public static ApiResponse<T> SuccessResult(T data) => new()
    {
        Success = true,
        Data = data
    };

    public static ApiResponse<T> ErrorResult(string errorMessage) => new()
    {
        Success = false,
        ErrorMessage = errorMessage
    };

    public static ApiResponse<T> ValidationErrorResult(List<string> errors) => new()
    {
        Success = false,
        ValidationErrors = errors
    };
}