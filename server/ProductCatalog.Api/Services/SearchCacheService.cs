namespace ProductCatalog.Api.Services;

/// <summary>
/// Interface for search result caching
/// </summary>
public interface ISearchCacheService
{
    bool TryGetCachedResults<T>(string cacheKey, out IEnumerable<T>? results);
    void CacheResults<T>(string cacheKey, IEnumerable<T> results, TimeSpan? expiration = null);
    void InvalidateCache(string? prefix = null);
}

/// <summary>
/// Simple caching layer using Dictionary<TKey, TValue>
/// as specified in requirements
/// </summary>
public class SearchCacheService : ISearchCacheService
{
    private readonly Dictionary<string, CacheEntry> _cache = new();
    private readonly object _lock = new();
    private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(5);

    public bool TryGetCachedResults<T>(string cacheKey, out IEnumerable<T>? results)
    {
        lock (_lock)
        {
            // Clean up expired entries periodically
            CleanupExpiredEntries();

            if (_cache.TryGetValue(cacheKey, out var entry))
            {
                if (entry.ExpiresAt > DateTime.UtcNow)
                {
                    results = entry.Value as IEnumerable<T>;
                    return results != null;
                }
                else
                {
                    _cache.Remove(cacheKey);
                }
            }
        }

        results = null;
        return false;
    }

    public void CacheResults<T>(string cacheKey, IEnumerable<T> results, TimeSpan? expiration = null)
    {
        var expirationTime = DateTime.UtcNow.Add(expiration ?? _defaultExpiration);
        var entry = new CacheEntry(results.ToList(), expirationTime);

        lock (_lock)
        {
            _cache[cacheKey] = entry;
        }
    }

    public void InvalidateCache(string? prefix = null)
    {
        lock (_lock)
        {
            if (string.IsNullOrEmpty(prefix))
            {
                _cache.Clear();
            }
            else
            {
                var keysToRemove = _cache.Keys
                    .Where(k => k.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                foreach (var key in keysToRemove)
                {
                    _cache.Remove(key);
                }
            }
        }
    }

    private void CleanupExpiredEntries()
    {
        var now = DateTime.UtcNow;
        var expiredKeys = _cache
            .Where(kvp => kvp.Value.ExpiresAt <= now)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
        {
            _cache.Remove(key);
        }
    }

    private record CacheEntry(object Value, DateTime ExpiresAt);
}
