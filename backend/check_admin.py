#!/usr/bin/env python
"""Script pour vérifier et corriger le role_type de l'utilisateur admin"""

import os
import sys
import django

# Configuration de Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def check_and_fix_admin():
    try:
        admin = User.objects.get(username='admin')
        print(f"✅ Utilisateur trouvé: {admin.username}")
        print(f"   - Email: {admin.email}")
        print(f"   - Is superuser: {admin.is_superuser}")
        print(f"   - Is staff: {admin.is_staff}")
        print(f"   - Role type: {admin.role_type}")
        print(f"   - Is active: {admin.is_active}")
        
        if admin.role_type != 'admin':
            print(f"\n⚠️  Role type incorrect: '{admin.role_type}' (devrait être 'admin')")
            admin.role_type = 'admin'
            admin.save()
            print("✅ Role type corrigé en 'admin'")
        else:
            print("\n✅ Role type correct: 'admin'")
            
        if not admin.is_superuser:
            print("\n⚠️  L'utilisateur n'est pas superuser")
            admin.is_superuser = True
            admin.is_staff = True
            admin.save()
            print("✅ Superuser et staff activés")
            
    except User.DoesNotExist:
        print("❌ Utilisateur 'admin' non trouvé")
        print("\nCréation de l'utilisateur admin...")
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='System'
        )
        admin.role_type = 'admin'
        admin.save()
        print("✅ Utilisateur admin créé avec succès")
        print(f"   - Username: admin")
        print(f"   - Password: admin123")
        print(f"   - Role type: {admin.role_type}")

if __name__ == '__main__':
    check_and_fix_admin()
