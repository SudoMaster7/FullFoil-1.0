import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3>FullFoil</h3>
                        <p>O destino premium para colecionadores e jogadores de cartas em todo o mundo.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Comprar</h4>
                        <ul>
                            <li><a href="#">Magic: The Gathering</a></li>
                            <li><a href="#">Pokémon</a></li>
                            <li><a href="#">Yu-Gi-Oh!</a></li>
                            <li><a href="#">Acessórios</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Suporte</h4>
                        <ul>
                            <li><a href="#">Status do Pedido</a></li>
                            <li><a href="#">Proteção ao Comprador</a></li>
                            <li><a href="#">Central de Ajuda</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Fique Conectado</h4>
                        <div className="newsletter">
                            <input type="email" placeholder="Digite seu e-mail" />
                            <button className="btn btn-primary">Inscrever</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 FullFoil. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
