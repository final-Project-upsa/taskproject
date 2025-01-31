from rest_framework import permissions

class IsOrganizationAdmin(permissions.BasePermission):
    """
    Allow access only to organization admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsOrganizationManager(permissions.BasePermission):
    """
    Allow access only to organization managers and admins.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'MANAGER']

class BelongsToSameOrganization(permissions.BasePermission):
    """
    Allow access only to users from the same organization.
    """
    def has_object_permission(self, request, view, obj):
        return obj.organization == request.user.organization
    
    
    
class TaskPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if user is authenticated and belongs to an organization
        return bool(request.user and request.user.is_authenticated and request.user.organization)

    def has_object_permission(self, request, view, obj):
        # Allow read access to users in the same organization
        if request.method in permissions.SAFE_METHODS:
            return obj.organization == request.user.organization

        # Allow write access to task creator, assignee, and department managers
        if request.user.role in ['ADMIN', 'MANAGER']:
            return obj.organization == request.user.organization
        
        return obj.created_by == request.user or obj.assigned_to == request.user