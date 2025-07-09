using dotnet_api.Models;

namespace dotnet_api.Services;

/// <summary>
/// Interface for cart operations following the Repository pattern
/// This abstraction allows for easy testing and different implementations
/// (e.g., in-memory, database, external service)
/// </summary>
public interface ICartService
{
    Task<Cart> CreateCartAsync(string userId);
    Task<Cart?> GetCartByIdAsync(int cartId);
    Task<Cart?> GetCartByUserIdAsync(string userId);
    Task<Cart> AddItemToCartAsync(int cartId, AddCartItemRequest item);
    Task<Cart> UpdateCartItemAsync(int cartId, int itemId, int quantity);
    Task<Cart> RemoveItemFromCartAsync(int cartId, int itemId);
    Task<bool> ClearCartAsync(int cartId);
    Task<bool> DeleteCartAsync(int cartId);
    Task<List<Cart>> GetAllCartsAsync();
}

/// <summary>
/// In-memory implementation of cart service for demonstration purposes
/// In a production environment, you would typically use Entity Framework Core
/// with a proper database like SQL Server, PostgreSQL, or Azure Cosmos DB
/// </summary>
public class InMemoryCartService : ICartService
{
    private readonly List<Cart> _carts = new();
    private readonly object _lock = new();
    private int _nextCartId = 1;
    private int _nextItemId = 1;

    public Task<Cart> CreateCartAsync(string userId)
    {
        lock (_lock)
        {
            // Check if user already has a cart (business rule: one cart per user)
            var existingCart = _carts.FirstOrDefault(c => c.UserId == userId);
            if (existingCart != null)
            {
                throw new InvalidOperationException($"User {userId} already has an active cart");
            }

            var cart = new Cart(
                Id: _nextCartId++,
                UserId: userId,
                Items: new List<CartItem>(),
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                TotalAmount: 0m,
                ItemCount: 0
            );

            _carts.Add(cart);
            return Task.FromResult(cart);
        }
    }

    public Task<Cart?> GetCartByIdAsync(int cartId)
    {
        lock (_lock)
        {
            var cart = _carts.FirstOrDefault(c => c.Id == cartId);
            return Task.FromResult(cart);
        }
    }

    public Task<Cart?> GetCartByUserIdAsync(string userId)
    {
        lock (_lock)
        {
            var cart = _carts.FirstOrDefault(c => c.UserId == userId);
            return Task.FromResult(cart);
        }
    }

    public Task<Cart> AddItemToCartAsync(int cartId, AddCartItemRequest itemRequest)
    {
        lock (_lock)
        {
            var cart = _carts.FirstOrDefault(c => c.Id == cartId);
            if (cart == null)
            {
                throw new ArgumentException($"Cart with ID {cartId} not found");
            }

            // Check if item already exists in cart (update quantity if so)
            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == itemRequest.ProductId);
            
            List<CartItem> updatedItems;
            if (existingItem != null)
            {
                // Update existing item quantity
                var newQuantity = existingItem.Quantity + itemRequest.Quantity;
                var updatedItem = existingItem with 
                { 
                    Quantity = newQuantity,
                    TotalPrice = newQuantity * existingItem.UnitPrice
                };
                
                updatedItems = cart.Items.Where(i => i.Id != existingItem.Id).ToList();
                updatedItems.Add(updatedItem);
            }
            else
            {
                // Add new item
                var newItem = new CartItem(
                    Id: _nextItemId++,
                    ProductId: itemRequest.ProductId,
                    ProductName: itemRequest.ProductName,
                    Quantity: itemRequest.Quantity,
                    UnitPrice: itemRequest.UnitPrice,
                    TotalPrice: itemRequest.Quantity * itemRequest.UnitPrice
                );
                
                updatedItems = new List<CartItem>(cart.Items) { newItem };
            }

            var updatedCart = RecalculateCartTotals(cart with 
            { 
                Items = updatedItems,
                UpdatedAt = DateTime.UtcNow 
            });

            // Replace cart in collection
            var index = _carts.FindIndex(c => c.Id == cartId);
            _carts[index] = updatedCart;

            return Task.FromResult(updatedCart);
        }
    }

    public Task<Cart> UpdateCartItemAsync(int cartId, int itemId, int quantity)
    {
        lock (_lock)
        {
            var cart = _carts.FirstOrDefault(c => c.Id == cartId);
            if (cart == null)
            {
                throw new ArgumentException($"Cart with ID {cartId} not found");
            }

            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null)
            {
                throw new ArgumentException($"Item with ID {itemId} not found in cart");
            }

            List<CartItem> updatedItems;
            if (quantity == 0)
            {
                // Remove item if quantity is 0
                updatedItems = cart.Items.Where(i => i.Id != itemId).ToList();
            }
            else
            {
                // Update item quantity
                var updatedItem = item with 
                { 
                    Quantity = quantity,
                    TotalPrice = quantity * item.UnitPrice
                };
                
                updatedItems = cart.Items.Where(i => i.Id != itemId).ToList();
                updatedItems.Add(updatedItem);
            }

            var updatedCart = RecalculateCartTotals(cart with 
            { 
                Items = updatedItems,
                UpdatedAt = DateTime.UtcNow 
            });

            // Replace cart in collection
            var index = _carts.FindIndex(c => c.Id == cartId);
            _carts[index] = updatedCart;

            return Task.FromResult(updatedCart);
        }
    }

    public Task<Cart> RemoveItemFromCartAsync(int cartId, int itemId)
    {
        lock (_lock)
        {
            var cart = _carts.FirstOrDefault(c => c.Id == cartId);
            if (cart == null)
            {
                throw new ArgumentException($"Cart with ID {cartId} not found");
            }

            var itemExists = cart.Items.Any(i => i.Id == itemId);
            if (!itemExists)
            {
                throw new ArgumentException($"Item with ID {itemId} not found in cart");
            }

            var updatedItems = cart.Items.Where(i => i.Id != itemId).ToList();
            var updatedCart = RecalculateCartTotals(cart with 
            { 
                Items = updatedItems,
                UpdatedAt = DateTime.UtcNow 
            });

            // Replace cart in collection
            var index = _carts.FindIndex(c => c.Id == cartId);
            _carts[index] = updatedCart;

            return Task.FromResult(updatedCart);
        }
    }

    public Task<bool> ClearCartAsync(int cartId)
    {
        lock (_lock)
        {
            var cart = _carts.FirstOrDefault(c => c.Id == cartId);
            if (cart == null)
            {
                return Task.FromResult(false);
            }

            var updatedCart = cart with 
            { 
                Items = new List<CartItem>(),
                TotalAmount = 0m,
                ItemCount = 0,
                UpdatedAt = DateTime.UtcNow 
            };

            // Replace cart in collection
            var index = _carts.FindIndex(c => c.Id == cartId);
            _carts[index] = updatedCart;

            return Task.FromResult(true);
        }
    }

    public Task<bool> DeleteCartAsync(int cartId)
    {
        lock (_lock)
        {
            var removed = _carts.RemoveAll(c => c.Id == cartId) > 0;
            return Task.FromResult(removed);
        }
    }

    public Task<List<Cart>> GetAllCartsAsync()
    {
        lock (_lock)
        {
            return Task.FromResult(new List<Cart>(_carts));
        }
    }

    /// <summary>
    /// Helper method to recalculate cart totals
    /// This ensures data consistency and follows the Single Responsibility Principle
    /// </summary>
    private static Cart RecalculateCartTotals(Cart cart)
    {
        var totalAmount = cart.Items.Sum(i => i.TotalPrice);
        var itemCount = cart.Items.Sum(i => i.Quantity);

        return cart with 
        { 
            TotalAmount = totalAmount,
            ItemCount = itemCount 
        };
    }
}