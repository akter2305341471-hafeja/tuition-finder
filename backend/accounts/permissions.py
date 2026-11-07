from rest_framework.permissions import BasePermission


def _role_permission(role):
    class RolePermission(BasePermission):
        message = f"Only {role.lower()} accounts can do this."

        def has_permission(self, request, view):
            user = request.user
            return bool(user and user.is_authenticated and user.role == role)

    RolePermission.__name__ = f"Is{role.title()}"
    return RolePermission


IsAdminRole = _role_permission("ADMIN")
IsGuardian = _role_permission("GUARDIAN")
IsTutor = _role_permission("TUTOR")
