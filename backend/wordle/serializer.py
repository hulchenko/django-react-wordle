# middleware to work with data parsing

from rest_framework import serializers
from .models import User, Leaderboard


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class LeaderboardSerializer(serializers.ModelSerializer):
    # append user values to the leaderboard record object
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    # ---
    class Meta:
        model = Leaderboard
        # fields = '__all__'
        fields = [
            "id",
            "user_email",
            "user_name",
            "score",
            "score_date",
            "games_played",
        ]
