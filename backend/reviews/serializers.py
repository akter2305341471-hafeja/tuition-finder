from django.contrib.auth import get_user_model
from rest_framework import serializers

from tuitions.models import Application

from .models import Review

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    tutor = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role="TUTOR"))
    guardian_name = serializers.CharField(source="guardian.first_name", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "tutor", "rating", "comment", "guardian_name", "created_at"]
        read_only_fields = ["created_at"]

    def validate(self, data):
        guardian = self.context["request"].user
        tutor = data["tutor"]
        hired = Application.objects.filter(post__guardian=guardian, tutor=tutor, status="ACCEPTED").exists()
        if not hired:
            raise serializers.ValidationError("You can only review a tutor you have hired.")
        if Review.objects.filter(guardian=guardian, tutor=tutor).exists():
            raise serializers.ValidationError("You have already reviewed this tutor.")
        return data
