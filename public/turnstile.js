// Cloudflare Turnstile Integration para Arco Iris Pet Shop
// Nota: Para usar em produção, substitua '1x00000000000000000000AA' pela sua Site Key real gerada no painel do Cloudflare Turnstile.

(function () {
    const SITE_KEY = '1x00000000000000000000AA'; // Chave de teste padrão do Cloudflare (substitua pela sua quando criar a conta)
    
    // Injetar script oficial do Cloudflare Turnstile
    if (!document.querySelector('script[src*="turnstile/v0/api.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    window.onloadTurnstileCallback = function () {
        // Procurar por containers de turnstile na página e renderizar
        const containers = document.querySelectorAll('.cf-turnstile');
        containers.forEach(container => {
            if (!container.dataset.rendered) {
                try {
                    turnstile.render(container, {
                        sitekey: SITE_KEY,
                        callback: function (token) {
                            console.log('Turnstile verificado com sucesso:', token);
                            window.turnstileToken = token;
                        },
                        'expired-callback': function () {
                            window.turnstileToken = null;
                        }
                    });
                    container.dataset.rendered = 'true';
                } catch (err) {
                    console.error('Erro ao renderizar Turnstile:', err);
                }
            }
        });
    };
})();
