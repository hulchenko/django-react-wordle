from django.urls import path
from . import views

urlpatterns = [
    path('', views.game, name="game"), # Game page
    path('/leaderboard', views.leaderboard, name="leaderboard"), # Leaderboard page
    # TODO path('/api/submit-score', views.submit_score, name="submit_score") # API to save score
]