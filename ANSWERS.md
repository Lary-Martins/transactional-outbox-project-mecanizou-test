
1. **Atomicidade:** Onde no código está garantida a atomicidade entre atualizar `orders` e inserir o evento na outbox?

2. **Publicação duplicada:** Como seu worker evita publicar o mesmo evento duas vezes? (Ou: se publicar 2x, por que isso não quebra o sistema?)

3. **Idempotência:** Como você implementou a idempotência no consumer? Qual é a chave idempotente usada?

      A responsabilidade por assegurar a não duplicação de registro é do banco de dados, fazendo com que, caso ocorra uma tentativa de duplicação, o banco lance um erro por violação de restrição. Para isso, foi definido a chave `order_id` como índice de unicidade na tabela `Invoices`.

4. **Ordem de operações:** Em que ordem você marca o evento como "publicado" e envia ao broker? Por que escolheu essa ordem?

5. **Cenários de falha:** Qual o comportamento do sistema quando:

   - DB confirma a transação, mas o broker falha
   - Broker publica, mas o worker cai antes de marcar como publicado
   - Consumer processa, mas cai antes de confirmar

6. **Trade-offs:** Que simplificações você fez por ser um teste com um prazo reduzido? O que faria diferente em produção?