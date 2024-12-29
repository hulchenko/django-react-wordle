from django.contrib import admin

from .models import User, Leaderboard

class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'score_date', 'games_played')

admin.site.register(User)
admin.site.register(Leaderboard, LeaderboardAdmin)