namespace ProductCatalog.Api.Services;

/// <summary>
/// Generic search engine using only core C# features (no external libraries)
/// Supports fuzzy matching with weighted scoring for multiple fields
/// </summary>
public class ProductSearchEngine
{
    // Configurable field weights for scoring
    private readonly Dictionary<string, double> _fieldWeights = new()
    {
        { "Name", 3.0 },
        { "Description", 1.5 },
        { "SKU", 2.0 }
    };

    /// <summary>
    /// Search for items with fuzzy matching and weighted scoring
    /// </summary>
    public IEnumerable<SearchResult<T>> Search<T>(
        IEnumerable<T> items,
        string searchTerm,
        Func<T, Dictionary<string, string?>> fieldExtractor)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return items.Select(item => new SearchResult<T>(item, 1.0));
        }

        var searchTermLower = searchTerm.ToLowerInvariant().Trim();
        var results = new List<SearchResult<T>>();

        foreach (var item in items)
        {
            var fields = fieldExtractor(item);
            double totalScore = 0;
            bool hasMatch = false;

            foreach (var field in fields)
            {
                if (string.IsNullOrEmpty(field.Value)) continue;

                var fieldValue = field.Value.ToLowerInvariant();
                var weight = _fieldWeights.GetValueOrDefault(field.Key, 1.0);

                // Calculate match score for this field
                double fieldScore = CalculateFieldScore(searchTermLower, fieldValue);

                if (fieldScore > 0)
                {
                    hasMatch = true;
                    totalScore += fieldScore * weight;
                }
            }

            if (hasMatch)
            {
                results.Add(new SearchResult<T>(item, totalScore));
            }
        }

        // Sort by score descending
        return results.OrderByDescending(r => r.Score);
    }

    /// <summary>
    /// Calculate match score between search term and field value
    /// Uses multiple matching strategies including fuzzy matching
    /// </summary>
    private double CalculateFieldScore(string searchTerm, string fieldValue)
    {
        double score = 0;

        // Exact match - highest score
        if (fieldValue.Equals(searchTerm, StringComparison.OrdinalIgnoreCase))
        {
            return 10.0;
        }

        // Contains match - high score
        if (fieldValue.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
        {
            score = 7.0;
            // Bonus for match at beginning
            if (fieldValue.StartsWith(searchTerm, StringComparison.OrdinalIgnoreCase))
            {
                score += 2.0;
            }
            return score;
        }

        // Word match - check if any word starts with search term
        var words = fieldValue.Split(new[] { ' ', '-', '_', '.' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in words)
        {
            if (word.StartsWith(searchTerm, StringComparison.OrdinalIgnoreCase))
            {
                return 5.0;
            }
        }

        // Fuzzy match using Levenshtein distance
        double fuzzyScore = CalculateFuzzyScore(searchTerm, fieldValue);
        if (fuzzyScore > 0)
        {
            return fuzzyScore;
        }

        return 0;
    }

    /// <summary>
    /// Calculate fuzzy match score using Levenshtein distance
    /// Returns score between 0-4 based on similarity
    /// </summary>
    private double CalculateFuzzyScore(string searchTerm, string text)
    {
        // For very short search terms, require closer matches
        int maxDistance = searchTerm.Length switch
        {
            <= 3 => 1,
            <= 6 => 2,
            _ => 3
        };

        // Check against whole text and individual words
        var candidates = new List<string> { text };
        candidates.AddRange(text.Split(new[] { ' ', '-', '_', '.' }, StringSplitOptions.RemoveEmptyEntries));

        foreach (var candidate in candidates)
        {
            // For longer candidates, check substrings
            if (candidate.Length > searchTerm.Length + maxDistance)
            {
                // Sliding window approach
                for (int i = 0; i <= candidate.Length - searchTerm.Length; i++)
                {
                    var substring = candidate.Substring(i, Math.Min(searchTerm.Length + maxDistance, candidate.Length - i));
                    int distance = LevenshteinDistance(searchTerm, substring.ToLowerInvariant());
                    if (distance <= maxDistance)
                    {
                        return 4.0 - distance; // Higher score for lower distance
                    }
                }
            }
            else
            {
                int distance = LevenshteinDistance(searchTerm, candidate.ToLowerInvariant());
                if (distance <= maxDistance)
                {
                    return 4.0 - distance;
                }
            }
        }

        return 0;
    }

    /// <summary>
    /// Calculate Levenshtein distance between two strings
    /// Pure C# implementation - no external libraries
    /// </summary>
    private int LevenshteinDistance(string source, string target)
    {
        if (string.IsNullOrEmpty(source)) return target?.Length ?? 0;
        if (string.IsNullOrEmpty(target)) return source.Length;

        int sourceLength = source.Length;
        int targetLength = target.Length;

        // Use single array optimization instead of full matrix
        var distances = new int[targetLength + 1];

        // Initialize first row
        for (int j = 0; j <= targetLength; j++)
        {
            distances[j] = j;
        }

        for (int i = 1; i <= sourceLength; i++)
        {
            int previousDiagonal = distances[0];
            distances[0] = i;

            for (int j = 1; j <= targetLength; j++)
            {
                int temp = distances[j];
                int cost = source[i - 1] == target[j - 1] ? 0 : 1;

                distances[j] = Math.Min(
                    Math.Min(distances[j] + 1, distances[j - 1] + 1),
                    previousDiagonal + cost
                );

                previousDiagonal = temp;
            }
        }

        return distances[targetLength];
    }
}

/// <summary>
/// Generic search result record with item and score
/// </summary>
public record SearchResult<T>(T Item, double Score);
