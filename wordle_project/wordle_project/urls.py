# Global/project level routing

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # references applications in the project
    path('admin/', admin.site.urls), # admin panel (default)
    path('', include('home.urls')), # landing page app
    path('game', include('game.urls')), # game(+leaderboard) app
]