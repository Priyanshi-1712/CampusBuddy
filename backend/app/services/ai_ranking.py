import math

class ResourceRanker:
    """
    AI Logic to rank campus resources (Notes, Books, Gear).
    Formula: Score = (AvgRating * 0.6) + (UploaderReputation * 0.3) + (Freshness * 0.1)
    """

    @staticmethod
    def calculate_score(avg_rating: float, total_reviews: int, uploader_trust: float, upload_date):
        m = 5  # Minimum reviews required to be considered reliable
        C = 3.5  # The average rating across the whole platform
        weighted_rating = (total_reviews / (total_reviews + m) * avg_rating) + (m / (total_reviews + m) * C)

        # 2. Freshness Score (Notes from this semester are more relevant)
        from datetime import datetime
        days_old = (datetime.now() - upload_date).days
        freshness = 1 / (1 + math.log1p(days_old)) # Decays over time

        # 3. Final Weighted Score
        final_score = (weighted_rating * 0.6) + (uploader_trust * 0.3) + (freshness * 0.1)
        
        return round(final_score, 2)