import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import userService from '../../services/userService';
import UserProfileLayout from './UserProfileLayout';
import './Profile.css';

function AddressBook() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        label: '',
        recipient_name: '',
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Brazil',
        phone_number: '',
        is_default: false
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const data = await userService.getAddresses();
            setAddresses(data);
        } catch (error) {
            toast.error('Erro ao carregar endereços');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.createAddress(formData);
            toast.success('Endereço adicionado!');
            setShowForm(false);
            setFormData({
                label: '',
                recipient_name: '',
                street: '',
                city: '',
                state: '',
                zip_code: '',
                country: 'Brazil',
                phone_number: '',
                is_default: false
            });
            loadAddresses();
        } catch (error) {
            toast.error('Erro ao salvar endereço');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este endereço?')) return;
        try {
            await userService.deleteAddress(id);
            toast.success('Endereço removido');
            loadAddresses();
        } catch (error) {
            toast.error('Erro ao remover endereço');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await userService.setAsDefault(id);
            toast.success('Definido como padrão');
            loadAddresses();
        } catch (error) {
            toast.error('Erro ao atualizar');
        }
    };

    return (
        <UserProfileLayout activePage="addresses">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Meus Endereços</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? 'Cancelar' : <><Plus size={18} /> Novo Endereço</>}
                </button>
            </div>

            {showForm && (
                <div className="address-form-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Rótulo (ex: Casa, Trabalho)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.label}
                                onChange={e => setFormData({ ...formData, label: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Nome do Destinatário</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.recipient_name}
                                onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Endereço Completo</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Cidade</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Estado</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>CEP</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.zip_code}
                                onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Telefone</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.is_default}
                                onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                                id="is_default"
                            />
                            <label htmlFor="is_default">Definir como endereço padrão</label>
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Salvar Endereço</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
            ) : addresses.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>Nenhum endereço cadastrado</p>
                </div>
            ) : (
                <div className="address-grid">
                    {addresses.map(address => (
                        <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                            <div className="address-label">
                                {address.label}
                                {address.is_default && <span className="default-badge">Padrão</span>}
                            </div>
                            <div className="address-details" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                <strong>{address.recipient_name}</strong><br />
                                {address.street}<br />
                                {address.city}, {address.state}<br />
                                CEP: {address.zip_code}<br />
                                {address.phone_number && <><small>Tel: {address.phone_number}</small></>}
                            </div>
                            <div className="address-actions">
                                {!address.is_default && (
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => handleSetDefault(address.id)}
                                        title="Definir como padrão"
                                        style={{ flex: 1 }}
                                    >
                                        <Check size={16} /> Padrão
                                    </button>
                                )}
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => handleDelete(address.id)}
                                    title="Excluir"
                                    style={{ color: '#ef4444' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </UserProfileLayout>
    );
}

export default AddressBook;
