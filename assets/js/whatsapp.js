// Integração com WhatsApp para pedidos
class WhatsAppIntegration {
    constructor() {
        this.phoneNumber = '5511999999999'; // Número do WhatsApp da loja (substitua pelo seu)
        this.init();
    }

    init() {
        // Adicionar eventos aos botões de finalizar pedido
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Evento para o botão de finalizar pedido na página de checkout
        document.addEventListener('DOMContentLoaded', () => {
            const whatsappBtn = document.getElementById('whatsapp-btn');
            if (whatsappBtn) {
                whatsappBtn.addEventListener('click', () => this.sendOrderToWhatsApp());
            }
        });
    }

    async sendOrderToWhatsApp() {
        try {
            // Obter itens do carrinho
            const cartItems = await cart.getItems();
            
            if (!cartItems || cartItems.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }

            // Gerar mensagem do pedido
            const orderMessage = this.generateOrderMessage(cartItems);
            
            // Criar URL do WhatsApp
            const whatsappUrl = this.createWhatsAppUrl(orderMessage);
            
            // Abrir WhatsApp
            window.open(whatsappUrl, '_blank');
            
        } catch (error) {
            console.error('Erro ao enviar pedido para WhatsApp:', error);
            alert('Erro ao processar pedido. Tente novamente.');
        }
    }

    generateOrderMessage(cartItems) {
        let message = '🛒 *NOVO PEDIDO - B7Store*\n\n';
        
        // Adicionar data e hora
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR');
        message += `📅 Data: ${dateStr}\n⏰ Hora: ${timeStr}\n\n`;
        
        // Adicionar itens do pedido
        message += '📦 *ITENS DO PEDIDO:*\n';
        let total = 0;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            message += `\n${index + 1}. *${item.name}*\n`;
            message += `   Quantidade: ${item.quantity}\n`;
            message += `   Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
            message += `   Subtotal: R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
        });
        
        // Adicionar total
        message += `\n💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
        
        // Adicionar informações adicionais
        message += '📋 *INFORMAÇÕES ADICIONAIS:*\n';
        message += '• Forma de pagamento: PIX\n';
        message += '• Frete: A calcular\n\n';
        
        // Adicionar instruções
        message += '📞 *PRÓXIMOS PASSOS:*\n';
        message += '1. Confirme seu endereço de entrega\n';
        message += '2. Aguarde o cálculo do frete\n';
        message += '3. Receba os dados para pagamento via PIX\n\n';
        
        message += '✅ Obrigado por escolher a B7Store!';
        
        return message;
    }

    createWhatsAppUrl(message) {
        // Codificar a mensagem para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Criar URL do WhatsApp
        const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
        
        return whatsappUrl;
    }

    // Método para atualizar o número do WhatsApp
    setPhoneNumber(phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    // Método para enviar mensagem personalizada
    sendCustomMessage(message) {
        const whatsappUrl = this.createWhatsAppUrl(message);
        window.open(whatsappUrl, '_blank');
    }
}

// Instância global da integração WhatsApp
const whatsappIntegration = new WhatsAppIntegration();

// Exportar para uso global
window.whatsappIntegration = whatsappIntegration;

