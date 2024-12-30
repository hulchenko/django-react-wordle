from django.urls import path
from . import views

urlpatterns = [
    # admin panel
    path("users/", views.get_users, name="get_users"),
    path("users/create", views.create_user, name="create_user"),
    # UI interaction
    path("leaderboard/", views.get_leaderboard, name="get_leaderboard"),
    path(
        "leaderboard/submit-score",
        views.create_leaderboard_record,
        name="create_leaderboard_record",
    ),
    path("new-game/", views.new_game, name="new_game"),
    path("submit-guess/", views.guess_word, name="guess_word"),
]
