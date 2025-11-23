export interface Vehicle {
    id: string
    user_id: string
    placa: string
    marca: string | null
    modelo: string | null
    cor: string | null
    ano: number | null
    created_at: string
}

export interface Profile {
    user_id: string
    saldo_creditos: number
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    user_id: string
    tipo: 'compra' | 'uso' | 'estorno'
    valor: number
    metodo_pagamento: string | null
    status: string
    session_id: string | null
    created_at: string
}

export interface Zone {
    id: string
    nome: string
    localizacao: string
    valor_hora: number
    horario_inicio: string
    horario_fim: string
    status: string
    vagas: number
    tolerancia_minutos: number
    lat: number | null
    lng: number | null
}
