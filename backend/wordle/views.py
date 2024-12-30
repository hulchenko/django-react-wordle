from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User, Leaderboard
from .serializer import UserSerializer, LeaderboardSerializer
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db.models import F


# User methods

@api_view(['GET'])
def get_users(request): # for admin panel
    users = get_list_or_404(User) # replaces User.objects.all(), but also throws 404 if failed to fetch
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request): # for admin panel
    new_user = request.data
    serializer = UserSerializer(data=new_user)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def get_user(request): # called from leaderboard POST
    # Check if user already exists, if not - create one
    user_email = request.data.get('user_email')
    user_name = request.data.get('user_name')
    user, is_new_user = User.objects.get_or_create(email=user_email)
    if is_new_user:
        user.name = user_name
        user.save() # store in DB
    return user

# ---

# Leaderboard methods

@api_view(['GET'])
def get_leaderboard(request):
    leaderboard = get_list_or_404(Leaderboard) # replaces Leaderboard.objects.all(); if empty -> "detail": "No Leaderboard matches the given query."
    serializer = LeaderboardSerializer(leaderboard, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_leaderboard_record(request):
    # expected frontend object
    # {
    #   "user_name": "Test",
    #   "user_email": "test@example.com",
    #   "score": 1000
    # }

    print("CREATE LEADERBOARD DATA: ", request.data)

    user = get_user(request)

    # Get/create leaderboard record
    leaderboard_record, is_new_record = Leaderboard.objects.get_or_create(user=user)
    leaderboard_record.score = request.data.get("score", 0)
    if is_new_record:
        leaderboard_record.games_played = 1
    else:
        leaderboard_record.games_played = F('games_played') + 1 # F is a built-in function for manipulating the existing DB data
    leaderboard_record.save() # store in DB

    # Refresh from DB to get updated games_played count
    leaderboard_record.refresh_from_db()

    serializer = LeaderboardSerializer(instance=leaderboard_record)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# ---