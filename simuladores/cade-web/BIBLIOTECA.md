# Biblioteca compartilhada

Envie os arquivos atualizados de `simuladores/cade-web/` e o arquivo
`config/command-library.php` para a HostGator. Preserve `config/.htaccess`.
A pasta `config` precisa permitir gravação pelo PHP da hospedagem.
Não substitua nem apague `config/command-library-data.php` em atualizações:
esse arquivo contém os circuitos publicados e deve entrar no backup do site.
Os arquivos de dados e controle são criados automaticamente no primeiro uso.

No menu **Exemplos de comandos**, abra **Abrir biblioteca / administrar**.
Informe a senha administrativa para publicar a folha atual, atualizar um
exemplo aberto ou excluir um exemplo. Use **Sair da administração** ao terminar.
A sessão administrativa dura duas horas. Visitantes têm somente leitura.
O menu consulta os exemplos ao abrir; abas abertas atualizam a lista a cada minuto.

Comandos antigos permanecem no armazenamento do navegador original. Entre como
administrador nesse navegador e use **Comandos antigos deste navegador** para
publicá-los. Também é possível abrir o JSON salvo e publicar a folha.

A instalação local e a hospedagem possuem bibliotecas independentes. Para todos
verem os mesmos exemplos, publique-os no endereço da hospedagem.
A senha não fica no JavaScript: apenas seu hash está em `config/command-library.php`.
Para alterá-la, gere um novo hash com `password_hash` no PHP e substitua o valor.
