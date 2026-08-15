// LGPD & Cookie Consent Banner para Arco Iris Pet Shop
(function () {
    const CONSENT_KEY = 'arcoiris_lgpd_consent';
    
    // Verificar se já aceitou
    if (localStorage.getItem(CONSENT_KEY)) {
        return;
    }

    // Criar elementos do banner
    const banner = document.createElement('div');
    banner.id = 'lgpdBanner';
    banner.innerHTML = `
        <div class="lgpd-content">
            <p>
                🐾 Nós utilizamos cookies e armazenamos dados para melhorar sua experiência de atendimento, agendamento e navegação, em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados)</strong>. 
                Ao continuar navegando, você concorda com a nossa <a href="#politica" id="lgpdPolicyLink">Política de Privacidade</a>.
            </p>
            <div class="lgpd-buttons">
                <button id="lgpdAccept" class="lgpd-btn lgpd-btn-accept">Aceitar e Fechar</button>
            </div>
        </div>
    `;

    // Estilos injetados dinamicamente
    const style = document.createElement('style');
    style.innerHTML = `
        #lgpdBanner {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #1e293b;
            color: #f8fafc;
            padding: 16px 20px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.25);
            z-index: 99999;
            font-family: inherit;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            animation: slideUpLGPD 0.4s ease-out;
        }
        @keyframes slideUpLGPD {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .lgpd-content {
            max-width: 1200px;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
        }
        #lgpdBanner p {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.5;
            flex: 1;
            min-width: 280px;
        }
        #lgpdBanner a {
            color: #38bdf8;
            text-decoration: underline;
        }
        .lgpd-buttons {
            display: flex;
            gap: 10px;
        }
        .lgpd-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 0.9rem;
            transition: background 0.2s;
        }
        .lgpd-btn-accept {
            background: #22c55e;
            color: #ffffff;
        }
        .lgpd-btn-accept:hover {
            background: #16a34a;
        }
        @media(max-width: 768px) {
            .lgpd-content {
                flex-direction: column;
                text-align: center;
            }
            .lgpd-buttons {
                width: 100%;
                justify-content: center;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Evento de clique em Aceitar
    document.getElementById('lgpdAccept').addEventListener('click', function () {
        localStorage.setItem(CONSENT_KEY, 'true');
        banner.style.transition = 'opacity 0.3s ease';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 300);
    });

    // Modal de Política de Privacidade simplificado
    document.getElementById('lgpdPolicyLink').addEventListener('click', function (e) {
        e.preventDefault();
        alert('Política de Privacidade - Arco Iris Pet Shop:\n\n1. Coleta de Dados: Coletamos apenas os dados essenciais (nome, telefone, endereço e informações do pet) para prestação dos serviços de banho, tosa e pet shop.\n2. Segurança: Seus dados são armazenados com segurança e nunca vendidos a terceiros.\n3. Seus Direitos: Você pode solicitar a exclusão ou alteração dos seus dados a qualquer momento entrando em contato conosco.');
    });
})();
