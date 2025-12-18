# Teste Técnico — Outbox + Processamento Idempotente

**Tempo sugerido:** 2 dias

---

## Contexto

Você está implementando uma feature em um sistema de marketplace. Sempre que um Pedido muda de status para `PAID`, precisamos disparar um evento `OrderPaid` para que outros serviços (ex.: faturamento, logística, notificações) processem isso.

**O problema:** não podemos perder eventos, e não podemos duplicar efeitos (ex.: gerar nota fiscal duas vezes). Também queremos suportar:

- Falhas temporárias (DB ok, broker fora; broker ok, worker caiu; etc.)
- Retentativas com backoff
- Entrega "pelo menos uma vez" (at-least-once) no broker, mas processamento idempotente no consumidor

Você vai construir uma solução simples, mas correta, usando o padrão **Transactional Outbox**.

---

## Requisitos

### 1) API de Pagamento

Implemente um endpoint:

```
POST /orders/:id/pay
```

Comportamento:

- Marca o pedido como `PAID`
- Registra na tabela de outbox um evento `OrderPaid`

**Payload mínimo do evento `OrderPaid`:**

```json
{
  "eventId": "uuid-v4",
  "eventType": "OrderPaid",
  "orderId": "uuid-do-pedido",
  "amount": 15990,
  "occurredAt": "2025-01-15T10:30:00Z"
}
```

> ⚠️ **Obrigatório:** A atualização do status do pedido e o registro do evento na outbox **devem acontecer na mesma transação de banco**.

---

### 2) Outbox Processor (Worker)

Implemente um worker/processo que:

- Busca eventos pendentes na outbox
- Publica esses eventos em um "broker" (pode ser fake/in-memory)
- Marca o evento como publicado
- Possui retry com backoff simples

**Simulação do broker:**

Você pode simular o broker como:

- Uma fila in-memory
- Um arquivo append-only
- Qualquer maneira que achar melhor

**Requisito de demonstração:**

Inclua uma forma de simular falhas no broker para comprovar que o retry funciona. Exemplo: um comando ou flag que force N falhas consecutivas antes de sucesso.

---

### 3) Consumidor Idempotente

Implemente um consumer que:

- Consome eventos `OrderPaid` do broker
- Executa um efeito colateral simulado:
  - "Gerar nota fiscal" → inserir em tabela `invoices`
  - **ou** "Criar entrega" → inserir em tabela `deliveries`

> ⚠️ **Obrigatório:** O consumer deve ser **idempotente**. Se o mesmo evento for entregue 2x (ou mais), o efeito não pode duplicar.

**Dica:** Pense em race conditions, o que acontece se dois workers tentarem processar o mesmo evento simultaneamente?

---

## Restrições e Escolhas Técnicas

| Item           | Requisito                               |
| -------------- | --------------------------------------- |
| Linguagem      | TypeScript/Node.js                      |
| Banco de dados | PostgreSQL (via docker-compose)         |
| Framework      | Livre (Express, Nest, ou sem framework) |
| Autenticação   | Não precisa                             |
| UI             | Não precisa                             |

**Foco:** Correção e clareza > quantidade de features

---

## O que NÃO esperamos (não perca tempo com isso)

- Testes automatizados extensivos
- Containerização completa da aplicação
- Métricas, tracing ou observabilidade avançada
- Múltiplos consumers em paralelo
- Tratamento de todos os edge cases possíveis

---

## Entregáveis

### A) Código

Projeto funcionando localmente com:

**README contendo:**

1. Como subir o ambiente (comandos)
2. Como executar o fluxo completo: `pay → outbox → consumer`
3. Como simular falhas no broker e comprovar que o retry funciona

---

### B) Modelagem de Dados

Inclua a estrutura das tabelas (SQL ou migrations).

**Tabelas esperadas:**

- `orders` (pedidos)
- `outbox_events` (eventos pendentes de publicação)
- `invoices` ou `deliveries` (efeito colateral do consumer)
- `processed_events` (opcional, pode ajudar na idempotência)

---

### C) Respostas Técnicas

No README ou em um arquivo `ANSWERS.md`, responda **objetivamente**:

1. **Atomicidade:** Onde no código está garantida a atomicidade entre atualizar `orders` e inserir o evento na outbox?

2. **Publicação duplicada:** Como seu worker evita publicar o mesmo evento duas vezes? (Ou: se publicar 2x, por que isso não quebra o sistema?)

3. **Idempotência:** Como você implementou a idempotência no consumer? Qual é a chave idempotente usada?

4. **Ordem de operações:** Em que ordem você marca o evento como "publicado" e envia ao broker? Por que escolheu essa ordem?

5. **Cenários de falha:** Qual o comportamento do sistema quando:

   - DB confirma a transação, mas o broker falha
   - Broker publica, mas o worker cai antes de marcar como publicado
   - Consumer processa, mas cai antes de confirmar

6. **Trade-offs:** Que simplificações você fez por ser um teste com um prazo reduzido? O que faria diferente em produção?

---

## Critérios de Avaliação

| Critério                   | O que olhamos                                        |
| -------------------------- | ---------------------------------------------------- |
| **Correção do Outbox**     | Transação real envolvendo pedido + evento            |
| **Idempotência real**      | Proteção contra duplicação mesmo com race conditions |
| **Retry funcional**        | Backoff implementado e demonstrável                  |
| **Clareza**                | Código legível, logs úteis, fluxo compreensível      |
| **Simplicidade**           | Sem overengineering para o escopo proposto           |
| **Capacidade de explicar** | Defender decisões na conversa técnica                |

---

## Sobre uso de IA

Pode usar IA (ChatGPT, Copilot, Claude, etc.) como apoio, assim como usaria documentação ou Stack Overflow.

**Porém**, na etapa de conversa técnica:

- Vou pedir para você **explicar suas decisões**
- Vou perguntar **por que você escolheu esse desenho**

Se a implementação estiver "bonita" mas você não souber defender as escolhas, vai ficar evidente. O objetivo é entender seu raciocínio.

---

## Como entregar

1. Suba o código em um repositório no Github
2. Envie o link do repositório na resposta desse e-mail
3. Prazo: 19/12 até o fim do dia

---

## Dúvidas?

Se algo não ficou claro, pode perguntar para garantir o entendimento :)

Boa sorte! 🚀
