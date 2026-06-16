(function() {
    class DiscordGandiExt {
        constructor() {
            this.token = '';
            this.ws = null;
            this.runtime = null;
            this.heartbeatInterval = null;
            this.signature = "\n\n-# by loldo_gg on discord";
            this.lastTexto = '';
            this.lastSender = '';
            this.lastSenderId = '';
            this.lastRoles = '';
            this.isConnected = false;
            this.messageListeners = [];
        }

        getInfo() {
            return {
                id: 'discordGandiLoldo',
                name: 'Discord Bot Connect',
                color1: '#5865F2',
                color2: '#404EED',
                blocks: [
                    {
                        opcode: 'definirToken',
                        blockType: 'command',
                        text: 'Conectar ao Bot com o Token [TOKEN]',
                        arguments: {
                            TOKEN: { type: 'string', defaultValue: 'seu_token_aqui' }
                        }
                    },
                    {
                        opcode: 'enviarMensagem',
                        blockType: 'command',
                        text: 'Enviar mensagem [TEXTO] no Canal ID [CANAL]',
                        arguments: {
                            TEXTO: { type: 'string', defaultValue: 'Olá Mundo!' },
                            CANAL: { type: 'string', defaultValue: '1234567890' }
                        }
                    },
                    {
                        opcode: 'enviarEmbed',
                        blockType: 'command',
                        text: 'Enviar Embed Titulo: [TITULO] Descrição: [DESC] Cor Hex: [COR] no Canal ID [CANAL]',
                        arguments: {
                            TITULO: { type: 'string', defaultValue: 'Aviso!' },
                            DESC: { type: 'string', defaultValue: 'Algo aconteceu.' },
                            COR: { type: 'string', defaultValue: '#FF0000' },
                            CANAL: { type: 'string', defaultValue: '1234567890' }
                        }
                    },
                    {
                        opcode: 'quandoMensagemRecebida',
                        blockType: 'hat',
                        text: 'quando mensagem do discord recebida',
                        isEdgeActivated: false
                    },
                    {
                        opcode: 'retornarTexto',
                        blockType: 'reporter',
                        text: 'TEXTO'
                    },
                    {
                        opcode: 'retornarSender',
                        blockType: 'reporter',
                        text: 'SENDER'
                    },
                    {
                        opcode: 'retornarSenderId',
                        blockType: 'reporter',
                        text: 'SENDER-ID'
                    },
                    {
                        opcode: 'retornarRoles',
                        blockType: 'reporter',
                        text: 'ROLES'
                    }
                ]
            };
        }

        definirToken(args, util) {
            this.token = args.TOKEN;
            this.runtime = util.runtime;
            
            // Fecha conexão existente
            this.disconnect();
            
            this.connectWebSocket();
        }

        connectWebSocket() {
            try {
                this.ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

                this.ws.onopen = () => {
                    console.log('✅ Conectado ao Discord Gateway');
                    this.isConnected = true;
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('❌ Erro ao processar mensagem:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('❌ Erro no WebSocket:', error);
                    this.isConnected = false;
                };

                this.ws.onclose = (event) => {
                    console.log('🔌 WebSocket fechado:', event.code, event.reason);
                    this.isConnected = false;
                    if (this.heartbeatInterval) {
                        clearInterval(this.heartbeatInterval);
                        this.heartbeatInterval = null;
                    }
                };
            } catch (error) {
                console.error('❌ Erro ao conectar WebSocket:', error);
            }
        }

        handleMessage(data) {
            const { op, t, d, s } = data;

            switch(op) {
                case 10: // Hello
                    const heartbeatInterval = d.heartbeat_interval;
                    if (this.heartbeatInterval) {
                        clearInterval(this.heartbeatInterval);
                    }
                    this.heartbeatInterval = setInterval(() => {
                        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                            this.ws.send(JSON.stringify({ op: 1, d: null }));
                        }
                    }, heartbeatInterval);

                    // Identify
                    if (this.token) {
                        this.ws.send(JSON.stringify({
                            op: 2,
                            d: {
                                token: this.token,
                                capabilities: 511,
                                properties: { 
                                    os: 'windows', 
                                    browser: 'chrome', 
                                    device: 'gandi' 
                                },
                                presence: { 
                                    status: 'online', 
                                    afk: false 
                                },
                                intents: 33280 // Guilds + GuildMessages + MessageContent
                            }
                        }));
                    }
                    break;

                case 0: // Dispatch
                    if (t === 'MESSAGE_CREATE') {
                        this.handleMessageCreate(d);
                    }
                    break;

                case 11: // Heartbeat ACK
                    console.log('💓 Heartbeat confirmado');
                    break;

                default:
                    // Ignorar outros eventos
                    break;
            }
        }

        handleMessageCreate(d) {
            // Verifica se é uma mensagem de bot ou do próprio bot
            if (d.author.bot) return;
            if (d.author.id === this.getBotId()) return;

            this.lastTexto = d.content || '';
            this.lastSender = d.author.username || 'Desconhecido';
            this.lastSenderId = d.author.id || '';
            this.lastRoles = d.member?.roles?.join(', ') || '';

            // Dispara todos os hats registrados
            if (this.runtime) {
                try {
                    this.runtime.startHats('discordGandiLoldo_quandoMensagemRecebida');
                } catch (error) {
                    console.error('❌ Erro ao iniciar hats:', error);
                }
            }
        }

        getBotId() {
            // Tenta extrair o ID do bot do token (não é 100% preciso, mas funciona para comparação)
            try {
                const payload = this.token.split('.')[0];
                const decoded = atob(payload);
                const data = JSON.parse(decoded);
                return data.id || '';
            } catch {
                return '';
            }
        }

        async enviarMensagem(args) {
            if (!this.token) {
                console.error('❌ Token não definido');
                return;
            }
            
            const canalId = args.CANAL.trim();
            if (!canalId || !/^\d+$/.test(canalId)) {
                console.error('❌ ID do canal inválido:', canalId);
                return;
            }

            try {
                const response = await fetch(`https://discord.com/api/v10/channels/${canalId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        content: args.TEXTO + this.signature 
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('❌ Erro ao enviar mensagem:', errorData);
                } else {
                    console.log('✅ Mensagem enviada com sucesso');
                }
            } catch (error) {
                console.error('❌ Erro na requisição:', error);
            }
        }

        async enviarEmbed(args) {
            if (!this.token) {
                console.error('❌ Token não definido');
                return;
            }

            const canalId = args.CANAL.trim();
            if (!canalId || !/^\d+$/.test(canalId)) {
                console.error('❌ ID do canal inválido:', canalId);
                return;
            }

            try {
                const corHex = args.COR.replace('#', '');
                const corInt = parseInt(corHex, 16);
                if (isNaN(corInt)) {
                    console.error('❌ Cor inválida, usando vermelho como padrão');
                }

                const response = await fetch(`https://discord.com/api/v10/channels/${canalId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        embeds: [{
                            title: args.TITULO || 'Sem título',
                            description: (args.DESC || '') + this.signature,
                            color: isNaN(corInt) ? 0xFF0000 : corInt
                        }]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('❌ Erro ao enviar embed:', errorData);
                } else {
                    console.log('✅ Embed enviado com sucesso');
                }
            } catch (error) {
                console.error('❌ Erro na requisição:', error);
            }
        }

        disconnect() {
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            
            if (this.ws) {
                try {
                    this.ws.close(1000, 'Desconectando manualmente');
                } catch (error) {
                    console.error('❌ Erro ao fechar WebSocket:', error);
                }
                this.ws = null;
            }
            
            this.isConnected = false;
        }

        retornarTexto() { return this.lastTexto || ''; }
        retornarSender() { return this.lastSender || ''; }
        retornarSenderId() { return this.lastSenderId || ''; }
        retornarRoles() { return this.lastRoles || ''; }
    }

    Scratch.extensions.register(new DiscordGandiExt());
})();
