# Laboratório de Lousa Digital — versão PHP

Cópia independente preparada para hospedagem Apache/PHP com MySQL na HostGator. A versão original não foi alterada.

## Publicação

1. Envie o conteúdo desta pasta para uma pasta dentro de `public_html` (ou para `public_html` se este for o site principal).
2. No cPanel, crie o banco de dados e o usuário MySQL correspondentes e associe o usuário ao banco com todos os privilégios. A configuração já usa `localhost` e os dados fornecidos.
3. Importe `sql/install.sql` pelo phpMyAdmin. O portal também abre com os valores padrão se a tabela ainda não estiver disponível.
4. Acesse `index.php`. O servidor precisa ter PHP com PDO MySQL habilitado.

## Estrutura

- `index.php`: portal e navegação por áreas.
- `simuladores/*.php`: simuladores convertidos para páginas PHP, mantendo seu HTML, CSS e JavaScript didáticos.
- `assets/images/`: fotografias, ilustrações, capas e diagramas usados pelo portal e simuladores.
- `assets/docs/`: materiais de aula para download.
- `assets/`: estilos, scripts e dependências visuais.
- `config/database.php`: credenciais MySQL.
- `includes/database.php`: conexão PDO e leitura das configurações do portal.
- `sql/install.sql`: tabela e identidade padrão do SENAI São Paulo.

O catálogo continua no arquivo `assets/catalogo.js`, permitindo manter a navegação e as simulações atuais sem dependência de dados obrigatórios no banco.
