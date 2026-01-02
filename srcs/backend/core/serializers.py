from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Circle, UserProfile, Task, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'created_by', 'assigned_to', 'created_at', 'circle']
        read_only_fields = ['created_by', 'circle']

class CircleSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Circle
        fields = ['id', 'name', 'description', 'created_at', 'member_count', 'invite_code']
        read_only_fields = ['invite_code']
        
    def get_member_count(self, obj):
        return obj.members.count()

class CircleDetailSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Circle
        fields = ['id', 'name', 'description', 'created_at', 'members', 'invite_code']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender', 'circle']

