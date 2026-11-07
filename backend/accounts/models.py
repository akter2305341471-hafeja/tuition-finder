from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN"
        GUARDIAN = "GUARDIAN"
        TUTOR = "TUTOR"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.GUARDIAN)
    phone = models.CharField(max_length=20, blank=True)


class TutorProfile(models.Model):
    class Verification(models.TextChoices):
        PENDING = "PENDING"
        APPROVED = "APPROVED"
        REJECTED = "REJECTED"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="tutor_profile")
    education = models.CharField(max_length=255, blank=True)
    experience = models.CharField(max_length=255, blank=True)
    subjects = models.CharField(max_length=255, blank=True, help_text="Comma separated")
    area = models.CharField(max_length=100, blank=True)
    expected_salary = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    verification = models.CharField(max_length=10, choices=Verification.choices, default=Verification.PENDING)

    def __str__(self):
        return f"Tutor: {self.user.username}"


class GuardianProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="guardian_profile")
    address = models.CharField(max_length=255, blank=True)
    area = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Guardian: {self.user.username}"
