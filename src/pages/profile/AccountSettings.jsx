import React from 'react';
import UserProfileLayout from './UserProfileLayout';

function AccountSettings() {
    return (
        <UserProfileLayout activePage="settings">
            <h2>Configurações da Conta</h2>
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>Configurações de segurança e preferências estarão disponíveis em breve.</p>
                <p>Para alterar sua senha, entre em contato com o suporte.</p>
            </div>
        </UserProfileLayout>
    );
}

export default AccountSettings;
