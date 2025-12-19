# Transactional Outbox Project - Desafio Técnico

Este projeto implementa o padrão **Transactional Outbox** para garantir a consistência eventual em um sistema de processamento de pedidos. A solução assegura que a atualização do status de um pedido e a criação do seu respectivo evento de integração ocorram de forma atômica.

## 🚀 Decisões de Arquitetura (Nível Pleno)

### 1. Atomicidade e Consistência (Requisito 1)
A implementação foca em resolver o problema de perda de eventos em sistemas distribuídos.
* **Transação de Banco de Dados**: Utilizei o recurso `$transaction` do Prisma no `OrderService` para garantir que o pedido só seja marcado como `PAID` se o evento for registrado com sucesso na tabela `OutboxEvent`.
* **Garantia de Entrega**: Se qualquer parte da operação falhar, o banco de dados realiza um rollback automático, evitando que um pedido seja pago sem gerar uma notificação para o sistema.

### 2. Padrões de Projeto e Clean Code
* **Singleton Pattern**: A conexão com o banco de dados é gerenciada por uma instância única através da classe `Database`, otimizando o uso do pool de conexões do PostgreSQL.
* **Injeção de Dependência**: O `OrderController` e o `OrderService` recebem suas dependências via construtor, o que desacopla o código e facilita a criação de testes unitários.
* **Composition Root**: As rotas são configuradas injetando as instâncias necessárias, mantendo a responsabilidade de criação centralizada.

## 🛠️ Tecnologias Utilizadas
* **Node.js (v20)** com **TypeScript** (ES Modules).
* **Express**: Framework para a API.
* **Prisma ORM**: Manipulação robusta de dados e transações.
* **Docker & Docker Compose**: Containerização necessária para subir o banco de dados PostgreSQL.
* **Morgan**: Middleware para logging de requisições HTTP em tempo real.

## 🏁 Como Executar

### Pré-requisitos
* Docker e Docker Compose instalados.
* Node.js v20+ instalado.

### Passo a Passo
1.  **Instalar dependências**:
    ```bash
    npm install
    ```
2.  **Subir o Banco de Dados (Docker)**:
    Este passo é obrigatório para que o Prisma consiga conectar-se ao PostgreSQL:
    ```bash
    docker-compose up -d
    ```
3.  **Configurar Variáveis de Ambiente**:
    Crie um arquivo `.env` na raiz do projeto com a sua `DATABASE_URL` apontando para o container (ex: `postgresql://user:password@localhost:5432/db`).
4.  **Preparar o Banco de Dados**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Iniciar a Aplicação**:
    ```bash
    npm run dev
    ```

## 🧪 Endpoints Disponíveis
* **Criar Pedido**: `POST /orders`
    * Payload: `{"amount": 100}`
* **Pagar Pedido (Fluxo Atômico)**: `POST /orders/:id/pay`
    * *Endpoint que executa a lógica da Outbox dentro de uma transação.*

## 📈 Roadmap e Próximos Passos
Devido ao prazo de entrega, o **Requisito 2 (Worker)** foi planejado para seguir a mesma estrutura de injeção de dependência:
1.  **Worker Service**: Um serviço que consulta eventos `PENDING` na `OutboxEvent`.
2.  **Resiliência**: Implementação de **Exponential Backoff** para tentativas de reenvio em caso de falha na integração externa.
3.  **Idempotência**: Garantia de que o processamento do evento não gere duplicidade no destino.