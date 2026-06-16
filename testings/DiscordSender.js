// Script para usar diretamente no console do Gandi IDE
window.discordBot = {
    token: '',
    signature: "\n\n-# by loldo_gg on discord",
    
    setToken(token) {
        this.token = token;
        console.log('Token definido!');
    },
    
    async sendMessage(texto, canal) {
        if (!this.token) return console.error('Token não definido');
        try {
            const response = await fetch(`https://discord.com/api/v10/channels/${canal}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: texto + this.signature })
            });
            console.log(response.ok ? '✅ Enviado!' : '❌ Erro:', await response.json());
        } catch (error) {
            console.error('Erro:', error);
        }
    },
    
    async sendEmbed(titulo, desc, cor, canal) {
        if (!this.token) return console.error('Token não definido');
        try {
            const corInt = parseInt(cor.replace('#', ''), 16) || 0;
            const response = await fetch(`https://discord.com/api/v10/channels/${canal}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [{
                        title: titulo,
                        description: desc + this.signature,
                        color: corInt
                    }]
                })
            });
            console.log(response.ok ? '✅ Embed enviado!' : '❌ Erro:', await response.json());
        } catch (error) {
            console.error('Erro:', error);
        }
    }
};

// Como usar no console:
// discordBot.setToken('SEU_TOKEN')
// discordBot.sendMessage('Olá!', 'ID_DO_CANAL')
// discordBot.sendEmbed('Título', 'Descrição', '#FF0000', 'ID_DO_CANAL')
