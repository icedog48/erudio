(function (){
    /*
     * @ErudioDoc Instituição Controller
     * @Module instituicoes
     * @Controller InstituicaoController
     */
    class ModeloGradeHorarioController {
        constructor (service, util, $mdDialog, erudioConfig, $timeout) {
            this.service = service;
            this.util = util;
            this.mdDialog = $mdDialog;
            this.erudioConfig = erudioConfig;
            this.timeout = $timeout;
            this.permissaoLabel = "MODELOS_HORARIO";
            this.titulo = "Modelos de Grade de Horário";
            this.linkModulo = "/#!/modelos-horario/";
            this.modelo = null;
            this.pagina = 0;
            this.finalLista = false;
            this.buscaIcone = 'search';
            this.iniciar();
        }
        
        verificarPermissao(){ return this.util.verificaPermissao(this.permissaoLabel); }
        verificaEscrita() { return this.util.verificaEscrita(this.permissaoLabel); }
        validarEscrita(opcao) { if (opcao.validarEscrita) { return this.util.validarEscrita(opcao.opcao, this.opcoes, this.escrita); } else { return true; } }
        
        preparaLista(){
            this.subheaders = [{ label: 'Nome do Modelo de Grade de Horário' }];
            this.opcoes = [{tooltip: 'Remover', icone: 'delete', opcao: 'remover', validarEscrita: true}];
            this.link = this.erudioConfig.dominio + this.linkModulo;
            this.fab = { tooltip: 'Adicionar Modelo de Grade de Horário', icone: 'add', href: this.link+'novo' };
            this.template = this.util.getTemplateLista();
            this.lista = this.util.getTemplateListaEspecifica('modelosGradeHorario');
        }
        
        preparaBusca(){
            this.busca = '';
            this.buscaSimples = this.util.getTemplateBuscaSimples();
        }
                
        buscarModelos(loader) {
            this.service.getAll({page: this.pagina},loader).then((modelos) => {
                if (this.pagina === 0) { this.objetos = modelos; } else { 
                    if (modelos.length !== 0) { this.objetos = this.objetos.concat(modelos); } else { this.finalLista = true; this.pagina--; }
                }
            });
        }
        
        executarOpcao(event,opcao,objeto) {
            this.modelo = objeto; this.modalExclusao(event);
        }
        
        modalExclusao(event) {
            var self = this;
            let confirm = this.util.modalExclusao(event, "Remover Modelo de Quadro de Horário", "Deseja remover este modelo de quadro de horário?", 'remover', this.mdDialog);
            this.mdDialog.show(confirm).then(function(){
                let id = self.modelo.id;
                var index = self.util.buscaIndice(id, self.objetos);
                if (index !== false) {
                    self.service.remover(self.modelo, "Modelo de Quadro de Horário","m", true);
                    self.objetos.splice(index,1);
                }
            });
        }
        
        verificaBusca(query) { if (this.util.isVazio(query)) { this.buscarModelos(); this.buscaIcone = 'search'; } else { this.executarBusca(query); this.buscaIcone = 'clear'; } }
        
        limparBusca() { this.busca = ''; $('.busca-simples').val(''); this.buscaIcone = 'search'; this.buscarModelos(true); }

        executarBusca(query) {
            this.timeout.cancel(this.delayBusca); var self = this;
            this.delayBusca = this.timeout(() => {
                self.buscaIcone = 'clear';
                if (self.util.isVazio(query)) { query = ''; self.buscaIcone = 'search'; }
                let tamanho = query.length;
                if (tamanho > 3) {
                    self.service.getAll({ nome: query },true).then((modelos) => { self.objetos = modelos; });
                } else {
                    self.util.toast('A busca é ativada com no mínimo 4 caracteres.');
                }
            },800);
        }
        
        paginar(){ this.pagina++; this.buscarModelos(true); }
        
        iniciar(){
            let permissao = this.verificarPermissao(); let self = this;
            if (permissao) {
                this.util.comPermissao();
                this.util.setTitulo(this.titulo);
                this.escrita = this.verificaEscrita();
                this.util.mudarImagemToolbar('modelosGradeHorario/assets/images/modelosGradeHorario.jpg');
                this.preparaLista();
                this.preparaBusca();
                this.buscarModelos();
                $(".fit-screen").scroll(function(){
                    let distancia = Math.floor(Number($(".conteudo").offset().top - $(document).height()));
                    let altura = Math.floor(Number($(".main-layout").height()));
                    let total = altura + distancia;
                    if (total === 0) { self.paginar(); }
                });
                this.util.inicializar();
            } else { this.util.semPermissao(); }
        }
    }
    
    ModeloGradeHorarioController.$inject = ["ModeloGradeHorarioService","Util","$mdDialog","ErudioConfig","$timeout"];
    angular.module('ModeloGradeHorarioController',['ngMaterial', 'util', 'erudioConfig']).controller('ModeloGradeHorarioController',ModeloGradeHorarioController);
})();