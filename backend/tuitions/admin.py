from django.contrib import admin

from .models import Application, TuitionPost

admin.site.register(TuitionPost)
admin.site.register(Application)
