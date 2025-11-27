// src/utils.ts

// Formata números para dinheiro (R$ 1.000,00)
export const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

// Lista para o menu "Tipo de Documento"
export const tiposDocumento = [
  'NOTA DE EMPENHO',
  'ORDEM DE FORNECIMENTO',
  'ORDEM DE COMPRA',
  'AUTORIZAÇÃO DE FORNECIMENTO',
  'PEDIDO DE COMPRA'
];

// Dicionário para o Tooltip (passe o mouse e veja o nome)
export const apresentacoes: Record<string, string> = {
  'CX': 'Caixa',
  'AMP': 'Ampola',
  'FRS': 'Frasco',
  'UN': 'Unidade',
  'PCT': 'Pacote',
  'BS': 'Bisnaga',
  'GL': 'Galão',
  'KIT': 'Kit',
  'COM': 'Comprimido'
};