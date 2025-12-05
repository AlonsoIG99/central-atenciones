from mongoengine import Document, StringField, DateTimeField, BooleanField
from datetime import datetime

class RefreshToken(Document):
    """Modelo de Refresh Token para MongoDB"""
    
    token = StringField(required=True, unique=True, index=True)
    user_id = StringField(required=True, index=True)
    expires_at = DateTimeField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    is_revoked = BooleanField(default=False)
    
    meta = {
        'collection': 'refresh_tokens',
        'indexes': ['token', 'user_id', 'expires_at']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'token': self.token,
            'user_id': self.user_id,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_revoked': self.is_revoked
        }
