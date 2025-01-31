from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status

class CustomAPIException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'A server error occurred.'

    def __init__(self, detail=None, field=None, status_code=None):
        if status_code is not None:
            self.status_code = status_code
        if detail is not None:
            self.detail = {'message': detail}
            if field:
                self.detail['field'] = field
        else:
            self.detail = {'message': self.default_detail}

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data = {
            'error': {
                'message': response.data.get('detail', str(exc)),
                'status_code': response.status_code
            }
        }
    
    return response