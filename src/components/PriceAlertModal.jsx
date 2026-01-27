import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';
import priceAlertService from '../services/priceAlertService';
import { toast } from 'react-hot-toast';

function PriceAlertModal({ product, onClose }) {
    const [targetPrice, setTargetPrice] = useState('');
    const [condition, setCondition] = useState('NM');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await priceAlertService.createAlert({
                product_id: product.id,
                target_price: parseFloat(targetPrice),
                condition
            });
            toast.success('Alerta criado com sucesso!');
            onClose();
        } catch (error) {
            toast.error('Erro ao criar alerta: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3>Criar Alerta de Preço</h3>
                    <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                </div>

                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={product.image_url} alt={product.name} style={{ width: 50, borderRadius: 4 }} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Preço Atual: R$ {product.market_price || 'N/A'}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Me avise quando o preço chegar a (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={targetPrice}
                            onChange={e => setTargetPrice(e.target.value)}
                            placeholder="Ex: 50.00"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Condição Mínima</label>
                        <select
                            value={condition}
                            onChange={e => setCondition(e.target.value)}
                            className="form-select"
                        >
                            <option value="NM">Near Mint (NM)</option>
                            <option value="LP">Lightly Played (LP)</option>
                            <option value="MP">Moderately Played (MP)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Criando...' : <><Bell size={18} style={{ marginRight: 8 }} /> Criar Alerta</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PriceAlertModal;
