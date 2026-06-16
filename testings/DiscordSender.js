// Extensão para Gandi IDE - Discord Bot Connect
(function() {
    class DiscordGandiExt {
        constructor() {
            this.token = '';
            this.signature = "\n\n-# by loldo_gg on discord";
        }

        getInfo() {
            return {
                id: 'discordGandiLoldo',
                name: 'Discord Bot',
                color1: '#5865F2',
                color2: '#404EED',
                blocks: [
                    {
                        opcode: 'setToken',
                        blockType: 'command',
                        text: 'definir token [TOKEN]',
                        arguments: {
                            TOKEN: {
                                type: 'string',
                                defaultValue: 'seu_token_aqui'
                            }
                        }
                    },
                    {
                        opcode: 'sendMessage',
                        blockType: 'command',
                        text: 'enviar mensagem [TEXTO] para canal [CANAL]',
                        arguments: {
                            TEXTO: {
                                type: 'string',
                                defaultValue: 'Olá Mundo!'
                            },
                            CANAL: {
                                type: 'string',
                                defaultValue: 'ID_DO_CANAL'
                            }
                        }
                    },
                    {
                        opcode: 'sendEmbed',
                        blockType: 'command',
                        text: 'enviar embed titulo [TITULO] desc [DESC] cor [COR] canal [CANAL]',
                        arguments: {
                            TITULO: {
                                type: 'string',
                                defaultValue: 'Título'
                            },
                            DESC: {
                                type: 'string',
                                defaultValue: 'Descrição'
                            },
                            COR: {
                                type: 'string',
                                defaultValue: '#FF0000'
                            },
                            CANAL: {
                                type: 'string',
                                defaultValue: 'ID_DO_CANAL'
                            }
                        }
                    }
                ]
            };
        }

        setToken(args) {
            this.token = args.TOKEN;
            console.log('Token definido!');
        }

        async sendMessage(args) {
            if (!this.token) {
                console.error('Token não definido!');
                return;
            }

            try {
                const response = await fetch(`https://discord.com/api/v10/channels/${args.CANAL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: args.TEXTO + this.signature
                    })
                });

                if (response.ok) {
                    console.log('Mensagem enviada!');
                } else {
                    const error = await response.json();
                    console.error('Erro:', error);
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        }

        async sendEmbed(args) {
            if (!this.token) {
                console.error('Token não definido!');
                return;
            }

            try {
                const corHex = args.COR.replace('#', '');
                const corInt = parseInt(corHex, 16) || 0;

                const response = await fetch(`https://discord.com/api/v10/channels/${args.CANAL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bot ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        embeds: [{
                            title: args.TITULO,
                            description: args.DESC + this.signature,
                            color: corInt
                        }]
                    })
                });

                if (response.ok) {
                    console.log('Embed enviado!');
                } else {
                    const error = await response.json();
                    console.error('Erro:', error);
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        }
    }

    // Registro para Gandi IDE
    if (typeof Scratch !== 'undefined' && Scratch.extensions) {
        Scratch.extensions.register(new DiscordGandiExt());
    } else {
        // Para quando carregar como script
        window.addEventListener('load', function() {
            if (typeof Scratch !== 'undefined' && Scratch.extensions) {
                Scratch.extensions.register(new DiscordGandiExt());
            }
        });
    }
})();
