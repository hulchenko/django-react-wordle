# Global/project level routing
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # references applications in the project
    path('admin/', admin.site.urls), # admin panel (default)
    path('wordle/', include('wordle.urls')), # game(+leaderboard) app
]
