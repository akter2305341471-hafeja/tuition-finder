from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import GuardianProfile, TutorProfile, User

admin.site.register(User, UserAdmin)
admin.site.register(TutorProfile)
admin.site.register(GuardianProfile)
