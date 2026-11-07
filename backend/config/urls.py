from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path


def spa(request, *args, **kwargs):
    """Serve the React app for every non-API page (React Router handles the route)."""
    index = settings.FRONTEND_BUILD / "index.html"
    if not index.exists():
        return HttpResponse("Frontend build not found. Run 'npm run build' inside the frontend folder.", status=501)
    return HttpResponse(index.read_text(encoding="utf-8"), content_type="text/html")


urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/", include("tuitions.urls")),
    path("api/", include("reviews.urls")),
    re_path(r"^(?!api/|django-admin/|static/).*$", spa),
]
