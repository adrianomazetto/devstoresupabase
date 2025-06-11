// Funções de autenticação
class Auth {
    constructor() {
        this.currentUser = null;
        this.initPromise = null;
        this.init();
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise(async (resolve) => {
            // Escutar mudanças no estado de autenticação
            const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.updateUI();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.updateUI();
                }
                // Resolver a promise na primeira vez que o evento for disparado
                // Isso garante que o estado inicial foi processado
                if (subscription) { // Verifica se a subscription existe para evitar chamadas múltiplas
                    subscription.unsubscribe(); // Desinscreve após o primeiro evento para evitar chamadas futuras
                }
                resolve();
            });
        });
        return this.initPromise;
    }

    async login(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            // Inserir ou atualizar dados do usuário na tabela users
            await this.upsertUser(data.user);

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            // Inserir dados do usuário na tabela users
            if (data.user) {
                await this.upsertUser(data.user);
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                throw error;
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async upsertUser(user) {
        try {
            const { error } = await supabaseClient
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email
                });

            if (error) {
                console.error('Erro ao inserir usuário na tabela users:', error);
            }
        } catch (error) {
            console.error('Erro ao inserir usuário na tabela users:', error);
        }
    }

    updateUI() {
        // Atualizar elementos do header baseado no estado de autenticação
        const userIcon = document.querySelector('a[href="login.html"]');
        if (userIcon) {
            if (this.currentUser) {
                // Usuário logado - mostrar opção de logout
                userIcon.innerHTML = `
                    <div style="position: relative; display: inline-block;">
                        <img src="assets/images/ui/user-line.png" alt="" />
                        <div class="user-menu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 10px; min-width: 150px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;">
                            <div style="padding: 5px 0; border-bottom: 1px solid #eee; margin-bottom: 5px; font-size: 12px; color: #666;">${this.currentUser.email}</div>
                            <a href="admin.html" style="display: block; padding: 5px 0; color: #333; text-decoration: none;">Administração</a>
                            <a href="#" id="logoutBtn" style="display: block; padding: 5px 0; color: #333; text-decoration: none;">Sair</a>
                        </div>
                    </div>
                `;
                userIcon.href = '#';
                
                // Adicionar evento de clique para mostrar/esconder menu
                userIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    const menu = userIcon.querySelector('.user-menu');
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                });

                // Adicionar evento de logout
                const logoutBtn = userIcon.querySelector('#logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const result = await this.logout();
                        if (result.success) {
                            window.location.href = 'index.html';
                        }
                    });
                }

                // Fechar menu ao clicar fora
                document.addEventListener('click', (e) => {
                    if (!userIcon.contains(e.target)) {
                        const menu = userIcon.querySelector('.user-menu');
                        if (menu) {
                            menu.style.display = 'none';
                        }
                    }
                });
            } else {
                // Usuário não logado - mostrar link de login
                userIcon.href = 'login.html';
                userIcon.innerHTML = '<img src="assets/images/ui/user-line.png" alt="" />';
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Instância global do Auth
const auth = new Auth();

// Funções para as páginas de login e registro
document.addEventListener('DOMContentLoaded', function() {
    // Página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const messageContainer = document.getElementById('message-container');
            
            // Desabilitar botão durante o processo
            loginBtn.disabled = true;
            loginBtn.textContent = 'Entrando...';
            
            const result = await auth.login(email, password);
            
            if (result.success) {
                messageContainer.innerHTML = '<div class="success-message">Login realizado com sucesso! Redirecionando...</div>';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                messageContainer.innerHTML = `<div class="error-message">Erro: ${result.error}</div>`;
                loginBtn.disabled = false;
                loginBtn.textContent = 'Entrar';
            }
        });
    }

    // Página de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const registerBtn = document.getElementById('registerBtn');
            const messageContainer = document.getElementById('message-container');
            
            // Verificar se as senhas coincidem
            if (password !== confirmPassword) {
                messageContainer.innerHTML = '<div class="error-message">As senhas não coincidem!</div>';
                return;
            }
            
            // Desabilitar botão durante o processo
            registerBtn.disabled = true;
            registerBtn.textContent = 'Cadastrando...';
            
            const result = await auth.register(email, password);
            
            if (result.success) {
                messageContainer.innerHTML = '<div class="success-message">Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.</div>';
                registerForm.reset();
            } else {
                messageContainer.innerHTML = `<div class="error-message">Erro: ${result.error}</div>`;
            }
            
            registerBtn.disabled = false;
            registerBtn.textContent = 'Cadastrar';
        });
    }
});

// Exportar para uso global
window.auth = auth;

