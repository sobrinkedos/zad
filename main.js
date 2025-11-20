// Sistema de Zona Azul Digital - Lógica Principal
// Autor: Sistema de Zona Azul
// Versão: 1.0.0

// ============================================================================
// CONFIGURAÇÃO E INICIALIZAÇÃO
// ============================================================================

// Estado global do aplicativo
let AppState = {
    currentUser: null,
    currentVehicle: null,
    activeSession: null,
    zones: [],
    vehicles: [],
    transactions: [],
    penalties: []
};

// Configurações do sistema
const SYSTEM_CONFIG = {
    currency: 'BRL',
    currencySymbol: 'R$',
    timeZone: 'America/Sao_Paulo',
    notificationTime: [15, 5], // minutos antes
    gracePeriod: 5, // minutos de tolerância
    maxParkingTime: 240, // minutos máximos (4 horas)
    minCreditPurchase: 10.00 // valor mínimo de compra
};

// ============================================================================
// UTILITÁRIOS E FUNÇÕES AUXILIARES
// ============================================================================

// Formatação de valores monetários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: SYSTEM_CONFIG.currency
    }).format(value);
}

// Formatação de tempo
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Validação de CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

// Validação de placa de veículo
function validateLicensePlate(plate) {
    // Padrão Mercosul (ABC1D23) ou padrão antigo (ABC1234)
    const mercosulPattern = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    const oldPattern = /^[A-Z]{3}[0-9]{4}$/;
    
    plate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    return mercosulPattern.test(plate) || oldPattern.test(plate);
}

// Geração de ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================================================
// BANCO DE DADOS SIMULADO (LOCAL STORAGE)
// ============================================================================

// Classe para gerenciar dados no localStorage
class LocalStorageDB {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Criar estrutura inicial se não existir
        if (!localStorage.getItem('za_users')) {
            localStorage.setItem('za_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('za_vehicles')) {
            localStorage.setItem('za_vehicles', JSON.stringify([]));
        }
        if (!localStorage.getItem('za_zones')) {
            this.initializeZones();
        }
        if (!localStorage.getItem('za_sessions')) {
            localStorage.setItem('za_sessions', JSON.stringify([]));
        }
        if (!localStorage.getItem('za_transactions')) {
            localStorage.setItem('za_transactions', JSON.stringify([]));
        }
        if (!localStorage.getItem('za_penalties')) {
            localStorage.setItem('za_penalties', JSON.stringify([]));
        }
    }

    initializeZones() {
        const defaultZones = [
            {
                id: 'zone_1',
                nome: 'Centro Comercial',
                localizacao: 'Rua Principal, 100-200',
                valor_hora: 5.00,
                horario_inicio: '08:00',
                horario_fim: '18:00',
                dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex'],
                tolerancia_minutos: 5,
                status: 'ativa',
                vagas: 50,
                created_at: new Date().toISOString()
            },
            {
                id: 'zone_2',
                nome: 'Zona Bancária',
                localizacao: 'Avenida Central, 500-600',
                valor_hora: 6.50,
                horario_inicio: '07:00',
                horario_fim: '19:00',
                dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex'],
                tolerancia_minutos: 3,
                status: 'ativa',
                vagas: 35,
                created_at: new Date().toISOString()
            },
            {
                id: 'zone_3',
                nome: 'Área Hospitalar',
                localizacao: 'Rua das Flores, 300-400',
                valor_hora: 4.00,
                horario_inicio: '06:00',
                horario_fim: '22:00',
                dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
                tolerancia_minutos: 10,
                status: 'ativa',
                vagas: 25,
                created_at: new Date().toISOString()
            },
            {
                id: 'zone_4',
                nome: 'Setor Cultural',
                localizacao: 'Praça da Liberdade, 1-50',
                valor_hora: 3.50,
                horario_inicio: '09:00',
                horario_fim: '17:00',
                dias_funcionamento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
                tolerancia_minutos: 15,
                status: 'ativa',
                vagas: 40,
                created_at: new Date().toISOString()
            }
        ];
        localStorage.setItem('za_zones', JSON.stringify(defaultZones));
    }

    // Métodos genéricos para CRUD
    getAll(collection) {
        const data = localStorage.getItem(`za_${collection}`);
        return data ? JSON.parse(data) : [];
    }

    getById(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === id);
    }

    getByField(collection, field, value) {
        const items = this.getAll(collection);
        return items.filter(item => item[field] === value);
    }

    create(collection, data) {
        const items = this.getAll(collection);
        const newItem = {
            id: generateId(),
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        items.push(newItem);
        localStorage.setItem(`za_${collection}`, JSON.stringify(items));
        return newItem;
    }

    update(collection, id, data) {
        const items = this.getAll(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...data,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(`za_${collection}`, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    delete(collection, id) {
        const items = this.getAll(collection);
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(`za_${collection}`, JSON.stringify(filteredItems));
        return true;
    }

    // Métodos específicos
    findUserByEmail(email) {
        const users = this.getAll('users');
        return users.find(user => user.email === email);
    }

    findUserByCPF(cpf) {
        const users = this.getAll('users');
        return users.find(user => user.cpf === cpf);
    }

    findVehicleByPlate(plate) {
        const vehicles = this.getAll('vehicles');
        return vehicles.find(vehicle => vehicle.placa === plate.toUpperCase());
    }

    getActiveParkingSessions() {
        const sessions = this.getAll('sessions');
        const now = new Date();
        return sessions.filter(session => {
            const endTime = new Date(session.tempo_fim);
            return session.status === 'ativa' && endTime > now;
        });
    }

    getUserActiveSession(userId) {
        const sessions = this.getAll('sessions');
        const now = new Date();
        return sessions.find(session => {
            const endTime = new Date(session.tempo_fim);
            return session.user_id === userId && 
                   session.status === 'ativa' && 
                   endTime > now;
        });
    }
}

// Instância global do banco de dados
const db = new LocalStorageDB();

// ============================================================================
// SISTEMA DE AUTENTICAÇÃO
// ============================================================================

class AuthService {
    static async login(email, password) {
        const user = db.findUserByEmail(email);
        if (!user || user.senha !== password) {
            throw new Error('Email ou senha inválidos');
        }
        return this.createSession(user);
    }

    static async register(userData) {
        // Validar CPF
        if (!validateCPF(userData.cpf)) {
            throw new Error('CPF inválido');
        }

        // Verificar se email já existe
        if (db.findUserByEmail(userData.email)) {
            throw new Error('Email já cadastrado');
        }

        // Verificar se CPF já existe
        if (db.findUserByCPF(userData.cpf)) {
            throw new Error('CPF já cadastrado');
        }

        const user = db.create('users', {
            ...userData,
            saldo_creditos: 0,
            tipo: 'motorista'
        });

        return this.createSession(user);
    }

    static createSession(user) {
        const session = {
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo,
                saldo_creditos: user.saldo_creditos
            },
            token: generateId(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        localStorage.setItem('za_current_user', JSON.stringify(session));
        AppState.currentUser = session.user;
        return session;
    }

    static logout() {
        localStorage.removeItem('za_current_user');
        AppState.currentUser = null;
        AppState.currentVehicle = null;
        AppState.activeSession = null;
    }

    static getCurrentUser() {
        const session = localStorage.getItem('za_current_user');
        if (session) {
            const sessionData = JSON.parse(session);
            // Verificar expiração
            if (new Date(sessionData.expires_at) > new Date()) {
                AppState.currentUser = sessionData.user;
                return sessionData.user;
            } else {
                this.logout();
            }
        }
        return null;
    }

    static updateUserBalance(userId, amount) {
        const user = db.getById('users', userId);
        if (user) {
            const newBalance = user.saldo_creditos + amount;
            db.update('users', userId, { saldo_creditos: newBalance });
            
            // Atualizar sessão atual
            if (AppState.currentUser && AppState.currentUser.id === userId) {
                AppState.currentUser.saldo_creditos = newBalance;
                const session = JSON.parse(localStorage.getItem('za_current_user'));
                session.user.saldo_creditos = newBalance;
                localStorage.setItem('za_current_user', JSON.stringify(session));
            }
        }
    }
}

// ============================================================================
// SERVIÇO DE VEÍCULOS
// ============================================================================

class VehicleService {
    static async registerVehicle(vehicleData) {
        if (!AppState.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        // Validar placa
        if (!validateLicensePlate(vehicleData.placa)) {
            throw new Error('Placa inválida');
        }

        // Verificar se placa já existe
        if (db.findVehicleByPlate(vehicleData.placa)) {
            throw new Error('Placa já cadastrada');
        }

        const vehicle = db.create('vehicles', {
            ...vehicleData,
            user_id: AppState.currentUser.id,
            placa: vehicleData.placa.toUpperCase()
        });

        return vehicle;
    }

    static getUserVehicles() {
        if (!AppState.currentUser) return [];
        return db.getByField('vehicles', 'user_id', AppState.currentUser.id);
    }

    static deleteVehicle(vehicleId) {
        const vehicle = db.getById('vehicles', vehicleId);
        if (!vehicle || vehicle.user_id !== AppState.currentUser.id) {
            throw new Error('Veículo não encontrado');
        }
        return db.delete('vehicles', vehicleId);
    }
}

// ============================================================================
// SERVIÇO DE ESTACIONAMENTO
// ============================================================================

class ParkingService {
    static async startParking(zoneId, vehicleId, durationMinutes) {
        if (!AppState.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const zone = db.getById('zones', zoneId);
        const vehicle = db.getById('vehicles', vehicleId);

        if (!zone || zone.status !== 'ativa') {
            throw new Error('Zona inválida ou inativa');
        }

        if (!vehicle || vehicle.user_id !== AppState.currentUser.id) {
            throw new Error('Veículo inválido');
        }

        // Verificar se já existe sessão ativa
        const activeSession = db.getUserActiveSession(AppState.currentUser.id);
        if (activeSession) {
            throw new Error('Você já tem uma sessão de estacionamento ativa');
        }

        // Calcular custo
        const hours = Math.ceil(durationMinutes / 60);
        const cost = hours * zone.valor_hora;

        // Verificar saldo
        if (AppState.currentUser.saldo_creditos < cost) {
            throw new Error('Saldo de créditos insuficiente');
        }

        const now = new Date();
        const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

        // Criar sessão
        const session = db.create('sessions', {
            user_id: AppState.currentUser.id,
            vehicle_id: vehicleId,
            zone_id: zoneId,
            tempo_inicio: now.toISOString(),
            tempo_fim: endTime.toISOString(),
            valor_total: cost,
            creditos_utilizados: cost,
            status: 'ativa'
        });

        // Debitar créditos
        AuthService.updateUserBalance(AppState.currentUser.id, -cost);

        // Criar transação
        db.create('transactions', {
            user_id: AppState.currentUser.id,
            tipo: 'uso',
            valor: cost,
            creditos: cost,
            metodo_pagamento: 'credito',
            status: 'concluido',
            session_id: session.id
        });

        AppState.activeSession = session;
        return session;
    }

    static async extendParking(sessionId, additionalMinutes) {
        if (!AppState.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const session = db.getById('sessions', sessionId);
        if (!session || session.user_id !== AppState.currentUser.id) {
            throw new Error('Sessão inválida');
        }

        if (session.status !== 'ativa') {
            throw new Error('Sessão não está ativa');
        }

        const zone = db.getById('zones', session.zone_id);
        const additionalHours = Math.ceil(additionalMinutes / 60);
        const additionalCost = additionalHours * zone.valor_hora;

        // Verificar saldo
        if (AppState.currentUser.saldo_creditos < additionalCost) {
            throw new Error('Saldo de créditos insuficiente para extensão');
        }

        // Atualizar sessão
        const currentEndTime = new Date(session.tempo_fim);
        const newEndTime = new Date(currentEndTime.getTime() + additionalMinutes * 60 * 1000);
        const totalCost = session.valor_total + additionalCost;

        const updatedSession = db.update('sessions', sessionId, {
            tempo_fim: newEndTime.toISOString(),
            valor_total: totalCost,
            creditos_utilizados: totalCost
        });

        // Debitar créditos
        AuthService.updateUserBalance(AppState.currentUser.id, -additionalCost);

        // Criar transação
        db.create('transactions', {
            user_id: AppState.currentUser.id,
            tipo: 'uso',
            valor: additionalCost,
            creditos: additionalCost,
            metodo_pagamento: 'credito',
            status: 'concluido',
            session_id: sessionId
        });

        AppState.activeSession = updatedSession;
        return updatedSession;
    }

    static async endParking(sessionId) {
        if (!AppState.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        const session = db.getById('sessions', sessionId);
        if (!session || session.user_id !== AppState.currentUser.id) {
            throw new Error('Sessão inválida');
        }

        const now = new Date();
        const startTime = new Date(session.tempo_inicio);
        const actualDuration = Math.floor((now - startTime) / (1000 * 60)); // minutos
        
        // Calcular valor real utilizado
        const zone = db.getById('zones', session.zone_id);
        const actualHours = Math.ceil(actualDuration / 60);
        const actualCost = actualHours * zone.valor_hora;
        
        // Se terminou antes, devolver crédito excedente
        if (actualCost < session.valor_total) {
            const refund = session.valor_total - actualCost;
            AuthService.updateUserBalance(AppState.currentUser.id, refund);
            
            // Criar transação de estorno
            db.create('transactions', {
                user_id: AppState.currentUser.id,
                tipo: 'estorno',
                valor: refund,
                creditos: refund,
                metodo_pagamento: 'credito',
                status: 'concluido',
                session_id: sessionId
            });
        }

        const updatedSession = db.update('sessions', sessionId, {
            tempo_fim: now.toISOString(),
            valor_total: actualCost,
            creditos_utilizados: actualCost,
            status: 'finalizada'
        });

        AppState.activeSession = null;
        return updatedSession;
    }

    static getActiveSession() {
        if (!AppState.currentUser) return null;
        return db.getUserActiveSession(AppState.currentUser.id);
    }
}

// ============================================================================
// SERVIÇO DE PAGAMENTOS
// ============================================================================

class PaymentService {
    static async purchaseCredits(amount, paymentMethod) {
        if (!AppState.currentUser) {
            throw new Error('Usuário não autenticado');
        }

        if (amount < SYSTEM_CONFIG.minCreditPurchase) {
            throw new Error(`Valor mínimo de compra: ${formatCurrency(SYSTEM_CONFIG.minCreditPurchase)}`);
        }

        // Simular processamento de pagamento
        await this.simulatePaymentProcessing(paymentMethod);

        // Adicionar créditos
        AuthService.updateUserBalance(AppState.currentUser.id, amount);

        // Criar transação
        const transaction = db.create('transactions', {
            user_id: AppState.currentUser.id,
            tipo: 'compra',
            valor: amount,
            creditos: amount,
            metodo_pagamento: paymentMethod,
            status: 'concluido'
        });

        return transaction;
    }

    static async simulatePaymentProcessing(method) {
        // Simular tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular falha aleatória (5% de chance)
        if (Math.random() < 0.05) {
            throw new Error('Erro no processamento do pagamento. Tente novamente.');
        }
    }

    static getTransactionHistory() {
        if (!AppState.currentUser) return [];
        return db.getByField('transactions', 'user_id', AppState.currentUser.id)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
}

// ============================================================================
// SERVIÇO DE FISCALIZAÇÃO
// ============================================================================

class EnforcementService {
    static async checkVehicle(plate, zoneId = null) {
        // Validar placa
        if (!validateLicensePlate(plate)) {
            throw new Error('Placa inválida');
        }

        const vehicle = db.findVehicleByPlate(plate);
        if (!vehicle) {
            return {
                status: 'not_found',
                message: 'Veículo não cadastrado no sistema'
            };
        }

        // Verificar sessão ativa
        const sessions = db.getAll('sessions');
        const now = new Date();
        const activeSession = sessions.find(session => {
            const endTime = new Date(session.tempo_fim);
            return session.vehicle_id === vehicle.id && 
                   session.status === 'ativa' && 
                   endTime > now;
        });

        if (activeSession) {
            const zone = db.getById('zones', activeSession.zone_id);
            const timeRemaining = Math.floor((new Date(activeSession.tempo_fim) - now) / (1000 * 60));
            
            return {
                status: 'valid',
                session: activeSession,
                vehicle: vehicle,
                zone: zone,
                timeRemaining: timeRemaining,
                message: 'Estacionamento válido'
            };
        } else {
            return {
                status: 'invalid',
                vehicle: vehicle,
                message: 'Sem sessão de estacionamento ativa'
            };
        }
    }

    static async issuePenalty(vehicleId, zoneId, reason = 'Estacionamento irregular') {
        const penalty = db.create('penalties', {
            vehicle_id: vehicleId,
            zone_id: zoneId,
            fiscal_id: AppState.currentUser ? AppState.currentUser.id : null,
            valor: 50.00, // Valor fixo da multa
            motivo: reason,
            foto_veiculo: 'simulada.jpg',
            localizacao: 'GPS simulado',
            status: 'ativa'
        });

        return penalty;
    }
}

// ============================================================================
// SERVIÇO ADMINISTRATIVO
// ============================================================================

class AdminService {
    static isAdmin() {
        return AppState.currentUser && AppState.currentUser.tipo === 'admin';
    }

    static createZone(zoneData) {
        if (!this.isAdmin()) {
            throw new Error('Acesso negado');
        }

        return db.create('zones', zoneData);
    }

    static updateZone(zoneId, zoneData) {
        if (!this.isAdmin()) {
            throw new Error('Acesso negado');
        }

        return db.update('zones', zoneId, zoneData);
    }

    static deleteZone(zoneId) {
        if (!this.isAdmin()) {
            throw new Error('Acesso negado');
        }

        return db.delete('zones', zoneId);
    }

    static getSystemStats() {
        if (!this.isAdmin()) {
            throw new Error('Acesso negado');
        }

        const users = db.getAll('users');
        const sessions = db.getAll('sessions');
        const transactions = db.getAll('transactions');
        const penalties = db.getAll('penalties');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySessions = sessions.filter(s => {
            const sessionDate = new Date(s.created_at);
            return sessionDate >= today;
        });

        const todayRevenue = transactions
            .filter(t => {
                const transactionDate = new Date(t.created_at);
                return transactionDate >= today && t.tipo === 'compra';
            })
            .reduce((sum, t) => sum + t.valor, 0);

        return {
            totalUsers: users.length,
            totalSessions: sessions.length,
            activeSessions: db.getActiveParkingSessions().length,
            todaySessions: todaySessions.length,
            totalRevenue: transactions.filter(t => t.tipo === 'compra').reduce((sum, t) => sum + t.valor, 0),
            todayRevenue: todayRevenue,
            totalPenalties: penalties.length,
            activeZones: db.getAll('zones').filter(z => z.status === 'ativa').length
        };
    }
}

// ============================================================================
// INICIALIZAÇÃO DO APLICATIVO
// ============================================================================

// Inicializar estado do aplicativo
function initializeApp() {
    try {
        console.log('Initializing app from main.js...');
        
        // Verificar usuário autenticado
        const currentUser = AuthService.getCurrentUser();
        console.log('Current user from main.js:', currentUser);
        
        // Carregar dados iniciais
        AppState.zones = db.getAll('zones').filter(zone => zone.status === 'ativa');
        console.log('Active zones loaded:', AppState.zones.length);
        
        if (currentUser) {
            AppState.vehicles = VehicleService.getUserVehicles();
            AppState.activeSession = ParkingService.getActiveSession();
            AppState.transactions = PaymentService.getTransactionHistory();
            console.log('User data loaded:', {
                vehicles: AppState.vehicles.length,
                activeSession: AppState.activeSession,
                transactions: AppState.transactions.length
            });
        }

        // Configurar atualização automática de sessões
        setInterval(updateActiveSessions, 60000); // Atualizar a cada minuto
        
        console.log('App initialized successfully from main.js');
    } catch (error) {
        console.error('Error initializing app from main.js:', error);
    }
}

// Atualizar sessões ativas (verificar expirações)
function updateActiveSessions() {
    if (AppState.activeSession) {
        const now = new Date();
        const endTime = new Date(AppState.activeSession.tempo_fim);
        
        if (now > endTime) {
            // Sessão expirada
            db.update('sessions', AppState.activeSession.id, { status: 'expirada' });
            AppState.activeSession = null;
            
            // Notificar usuário
            if (typeof showNotification === 'function') {
                showNotification('Sessão de estacionamento expirada!', 'warning');
            }
        }
    }
}

// ============================================================================
// EXPORTAR SERVIÇOS PARA USO GLOBAL
// ============================================================================

window.AppState = AppState;
window.AuthService = AuthService;
window.VehicleService = VehicleService;
window.ParkingService = ParkingService;
window.PaymentService = PaymentService;
window.EnforcementService = EnforcementService;
window.AdminService = AdminService;
window.db = db;
window.initializeApp = initializeApp;
window.formatCurrency = formatCurrency;
window.formatTime = formatTime;
window.validateCPF = validateCPF;
window.validateLicensePlate = validateLicensePlate;