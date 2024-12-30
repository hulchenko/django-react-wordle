from django.db import models
from django.utils import timezone

class User(models.Model):
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)

    # def __str__(self):
    #     return f"{self.name}, {self.email}"
    
    def to_dict(self):
        user_obj = {
            'name': self.name,
            'email': self.email
        }
        return user_obj
        
    
# Test users: <QuerySet [<User: Test, test@example.com>, <User: Test1, test1@example.com>]>

class Leaderboard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # remove user if the record is removed from the leaderboard
    score = models.IntegerField(default=0)
    score_date = models.DateTimeField(default=timezone.now)
    games_played = models.IntegerField(default=0)

    # def __str__(self):
    #     return f"{self.user.email}, {self.score}, {self.score_date}, {self.games_played}"
    
    def to_dict(self):
        user_obj = {
            'name': self.name,
            'email': self.email
        }
        leaderboard_obj = {
            'user': user_obj,
            'score': self.score,
            'score_date': self.score_date,
            'games_played': self.games_played
        }
        return leaderboard_obj

# Test leaderboard: <QuerySet [<Leaderboard: test@example.com, 999, 2024-12-28 20:39:11.768485+00:00, 1>, <Leaderboard: test1@example.com, 998, 2024-12-28 20:42:04.363431+00:00, 1>]>